import json
import glob
import os
import re
import math
import argparse

def parse_marketplace_data(base_path):
    all_products = []
    chunk_files = glob.glob(os.path.join(base_path, 'src', 'data', 'marketplace', 'chunk_*.json'))
    for file in chunk_files:
        with open(file, 'r', encoding='utf-8') as f:
            all_products.extend(json.load(f))
            
    components = {
        'motors': [],
        'batteries': [],
        'props': [],
        'escs': [],
        'frames': [],
        'payloads': []
    }

    for p in all_products:
        cat = p.get('category', '')
        sub = p.get('subcategory', '')
        name = p.get('name', '')
        features = p.get('features', [])
        desc = p.get('description', '')
        if features is None: features = []
        
        text_block = name + " | " + " | ".join(features) + " | " + str(desc)
        weight_kg = p.get('weight_kg')
        if weight_kg is None:
            weight_match = re.search(r'Weight(?: \(grams\))?:\s*([0-9]*\.?[0-9]+)\s*(kg|g)', text_block, re.IGNORECASE)
            if weight_match:
                try:
                    val = float(weight_match.group(1))
                    unit = weight_match.group(2).lower()
                    weight_kg = val if unit == 'kg' else val / 1000.0
                except ValueError:
                    weight_kg = 0.5
            else:
                weight_kg = 0.5  # Fallback

        price = p.get('base_price', 0)
        if price is None: price = 0
        
        # Parse Motors
        if sub == 'Motors' or 'Brushless Motor' in name:
            kv_match = re.search(r'([0-9]+)\s*KV', text_block, re.IGNORECASE)
            thrust_match = re.search(r'([0-9.]+)\s*kg(?:\s*Maximum)?\s*Thrust', text_block, re.IGNORECASE)
            kv = int(kv_match.group(1)) if kv_match else 400
            thrust = float(thrust_match.group(1)) if thrust_match else (3.0 if kv > 300 else 18.0)
            
            components['motors'].append({
                'id': p['id'], 'name': name, 'weight_kg': weight_kg, 
                'kv': kv, 'max_thrust_kg': thrust, 'price': price, 
                'class': 'industrial' if thrust > 10 else 'medium', 
                'voltage_req': 'HV' if kv < 100 else 'LV', 
                'efficiency_hover': 11.0, 'max_amps': 60
            })
                
        # Parse Batteries
        elif sub == 'Batteries' or 'Battery' in name:
            volt_match = re.search(r'Voltage:\s*([0-9.]+)\s*V', text_block, re.IGNORECASE)
            cap_match = re.search(r'Capacity \(Ah\):\s*([0-9.]+)\s*(?:Ah|mAh)', text_block, re.IGNORECASE)
            
            volt = float(volt_match.group(1)) if volt_match else 22.2
            cap = float(cap_match.group(1)) if cap_match else 16.0
            if 'mAh' in text_block and cap > 1000:
                cap = cap / 1000.0
                
            components['batteries'].append({
                'id': p['id'], 'name': name, 'weight_kg': weight_kg, 
                'voltage': volt, 'capacity_wh': volt * cap, 
                'price': price, 'type': 'HV' if volt > 100 else 'LV'
            })
            
        # Parse Props
        elif cat == 'Propellers' or 'Propeller' in name:
            size_match = re.search(r'([0-9]+)(?:-inch|")', name, re.IGNORECASE)
            size = int(size_match.group(1)) if size_match else 15
            components['props'].append({
                'id': p['id'], 'name': name, 'size': size, 
                'weight_kg': weight_kg, 'price': price
            })
            
        # Parse ESCs
        elif sub == 'Electronic Speed Controllers' or 'ESC' in name:
            amp_match = re.search(r'([0-9]+)A', name, re.IGNORECASE)
            rating = int(amp_match.group(1)) if amp_match else 60
            components['escs'].append({
                'id': p['id'], 'name': name, 'weight_kg': weight_kg, 
                'rating': rating, 'price': price, 'type': 'single'
            })
            
        # Parse Payloads/Cameras/Jammers
        elif cat in ['Payloads', 'Jamming Systems', 'Sensors', 'RF Communications']:
            power_match = re.search(r'([0-9]+)\s*W', text_block, re.IGNORECASE)
            power_draw = float(power_match.group(1)) if power_match else 10.0
            components['payloads'].append({
                'id': p['id'], 'name': name, 'weight_kg': weight_kg, 
                'power_draw_w': power_draw, 'price': price, 'category': cat
            })
            
        # Parse Frames
        elif cat in ['Drone Platforms', 'Platforms', 'Drone Frames']:
            arms_match = re.search(r'(?:Quad|4 arms|Hex|6 arms|Octo|8 arms)', text_block, re.IGNORECASE)
            arms = 4
            if arms_match:
                if 'Hex' in arms_match.group(0) or '6' in arms_match.group(0): arms = 6
                if 'Octo' in arms_match.group(0) or '8' in arms_match.group(0): arms = 8
            
            vtype = 'multirotor'
            if 'Fixed-Wing' in text_block or 'Talon' in name: vtype = 'fixedwing'
            if 'UGV' in text_block or 'Rover' in name: vtype = 'ugv'
            
            components['frames'].append({
                'id': p['id'], 'name': name, 'weight_kg': weight_kg, 
                'arms': arms, 'price': price, 'type': vtype,
                'min_prop': 10, 'max_prop': 80, 'class': 'industrial' if weight_kg > 5 else 'medium'
            })
            
    # Add dummy entries if marketplace is missing some categories during testing
    if not components['props']:
        components['props'].append({'id': 'dummy_prop', 'name': 'Dummy 15-inch Prop', 'size': 15, 'weight_kg': 0.03, 'price': 20})
    if not components['escs']:
        components['escs'].append({'id': 'dummy_esc', 'name': 'Dummy 60A ESC', 'weight_kg': 0.05, 'rating': 60, 'price': 30, 'type': 'single'})
    if not components['frames']:
         components['frames'].append({'id': 'dummy_quad', 'name': 'Dummy Quad', 'weight_kg': 2.0, 'arms': 4, 'price': 100, 'type': 'multirotor', 'min_prop': 10, 'max_prop': 20, 'class': 'medium'})
         components['frames'].append({'id': 'dummy_fw', 'name': 'Dummy Fixed Wing', 'weight_kg': 2.5, 'arms': 1, 'price': 500, 'type': 'fixedwing', 'min_prop': 10, 'max_prop': 20, 'class': 'medium'})
         components['frames'].append({'id': 'dummy_ugv', 'name': 'Dummy UGV Rover', 'weight_kg': 15.0, 'arms': 4, 'price': 800, 'type': 'ugv', 'min_prop': 0, 'max_prop': 0, 'class': 'industrial'})

    return components

def calc_multirotor(frame, motor, prop, batt, esc, target_payload_kg):
    arms = frame['arms']
    if motor['class'] != frame['class']: return None
    if prop['size'] < frame['min_prop'] or prop['size'] > frame['max_prop']: return None
    
    totalAUW = frame['weight_kg'] + (motor['weight_kg'] * arms) + (prop['weight_kg'] * arms) + batt['weight_kg'] + target_payload_kg + (esc['weight_kg'] * arms)
    totalMaxThrust = motor['max_thrust_kg'] * arms
    
    if totalMaxThrust <= 0: return None
    hoverThrottle = (totalAUW / totalMaxThrust) * 100
    if hoverThrottle > 75: return None
        
    hoverPowerW = (totalAUW * 1000) / motor['efficiency_hover']
    flightTimeHrs = (batt['capacity_wh'] / hoverPowerW) * 0.8
    
    cruiseSpeed = 40.0 # simplified
    rangeKm = flightTimeHrs * cruiseSpeed
    cost = frame['price'] + (motor['price']*arms) + (prop['price']*arms) + batt['price'] + (esc['price']*arms)
    
    return {'auw_kg': totalAUW, 'flight_time_min': flightTimeHrs * 60, 'range_km': rangeKm, 'hover_throttle': hoverThrottle, 'cost': cost}

def calc_fixedwing(frame, motor, prop, batt, esc, target_payload_kg, glide_ratio=12, vtol=False):
    arms = 4 if vtol else 1
    totalAUW = frame['weight_kg'] + (motor['weight_kg'] * arms) + (prop['weight_kg'] * arms) + batt['weight_kg'] + target_payload_kg + (esc['weight_kg'] * arms)
    
    hoverThrottle = 0
    if vtol:
        totalMaxThrust = motor['max_thrust_kg'] * arms
        if totalMaxThrust <= 0: return None
        hoverThrottle = (totalAUW / totalMaxThrust) * 100
        if hoverThrottle > 85: return None # lenient for vtol
        
    # Forward flight required thrust
    fwd_thrust_req = totalAUW / glide_ratio
    # Assuming one forward motor if VTOL (4 lift + 1 fwd). Simplify to just max_thrust
    if motor['max_thrust_kg'] < fwd_thrust_req: return None
    
    # Cruise power roughly proportional to required thrust
    cruisePowerW = (fwd_thrust_req * 1000) / (motor['efficiency_hover'] * 1.5) # more efficient in forward flight
    flightTimeHrs = (batt['capacity_wh'] / cruisePowerW) * 0.8
    
    cruiseSpeed = 60.0
    rangeKm = flightTimeHrs * cruiseSpeed
    cost = frame['price'] + (motor['price']*arms) + (prop['price']*arms) + batt['price'] + (esc['price']*arms)
    
    return {'auw_kg': totalAUW, 'flight_time_min': flightTimeHrs * 60, 'range_km': rangeKm, 'hover_throttle': hoverThrottle, 'cost': cost}

def calc_ugv(frame, motor, batt, esc, target_payload_kg, rolling_res=0.025):
    arms = 4 # 4 wheels/motors
    totalAUW = frame['weight_kg'] + (motor['weight_kg'] * arms) + batt['weight_kg'] + target_payload_kg + (esc['weight_kg'] * arms)
    
    # Force required = m * g * mu_r
    force_n = totalAUW * 9.81 * rolling_res
    # Simplified motor torque check: just ensure motor is strong enough. 1kg thrust roughly = 10N force capable
    if (motor['max_thrust_kg'] * 9.81 * arms) < force_n * 2: return None
    
    # Rolling power
    speed_ms = 5.0 # 18 km/h
    powerW = force_n * speed_ms / 0.8 # 80% drivetrain efficiency
    driveTimeHrs = (batt['capacity_wh'] / powerW) * 0.8
    
    rangeKm = driveTimeHrs * (speed_ms * 3.6)
    cost = frame['price'] + (motor['price']*arms) + batt['price'] + (esc['price']*arms)
    
    return {'auw_kg': totalAUW, 'flight_time_min': driveTimeHrs * 60, 'range_km': rangeKm, 'hover_throttle': 0, 'cost': cost}

def optimize(components, ptype, target_payload_kg, min_range_km, glide_ratio=12, rolling_res=0.025, vtol=False):
    valid = []
    frames = [f for f in components['frames'] if f['type'] == ptype or (ptype == 'vtol' and f['type'] == 'fixedwing')]
    if not frames: 
        # Fallback to allow multirotor frame to be tested if no specific frame
        frames = components['frames']
        
    for frame in frames:
        for motor in components['motors']:
            for batt in components['batteries']:
                for esc in components['escs']:
                    if ptype == 'ugv':
                        res = calc_ugv(frame, motor, batt, esc, target_payload_kg, rolling_res)
                        prop = None
                    else:
                        for prop in components['props']:
                            if ptype == 'multirotor':
                                res = calc_multirotor(frame, motor, prop, batt, esc, target_payload_kg)
                            elif ptype == 'fixedwing' or ptype == 'vtol':
                                res = calc_fixedwing(frame, motor, prop, batt, esc, target_payload_kg, glide_ratio, vtol=(ptype=='vtol'))
                            
                            if res and res['range_km'] >= min_range_km:
                                res['frame'] = frame['name']
                                res['motor'] = motor['name']
                                res['prop'] = prop['name'] if prop else 'N/A'
                                res['battery'] = batt['name']
                                res['esc'] = esc['name']
                                valid.append(res)
                    if ptype == 'ugv' and res and res['range_km'] >= min_range_km:
                        res['frame'] = frame['name']
                        res['motor'] = motor['name']
                        res['prop'] = 'Wheels/Tracks'
                        res['battery'] = batt['name']
                        res['esc'] = esc['name']
                        valid.append(res)
                        
    valid.sort(key=lambda x: (x['cost'], -x['range_km']))
    return valid

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SKHY Multi-Platform Optimizer")
    parser.add_argument("--type", choices=['multirotor', 'fixedwing', 'ugv', 'vtol'], default='multirotor')
    parser.add_argument("--payload", type=float, default=2.0)
    parser.add_argument("--range", type=float, default=5.0)
    parser.add_argument("--glide-ratio", type=float, default=12.0)
    parser.add_argument("--rolling-res", type=float, default=0.025)
    
    args = parser.parse_args()
    
    base_path = "C:/Projects/skhyai-website/skhy-ai-website-main"
    comps = parse_marketplace_data(base_path)
    print(f"Parsed: {len(comps['frames'])} Frames, {len(comps['motors'])} Motors, {len(comps['batteries'])} Batteries, {len(comps['props'])} Props, {len(comps['payloads'])} Payloads.")
    
    print(f"--- Optimizing {args.type.upper()} for Payload: {args.payload}kg, Min Range: {args.range}km ---")
    
    configs = optimize(comps, args.type, args.payload, args.range, args.glide_ratio, args.rolling_res, vtol=(args.type=='vtol'))
    
    if not configs:
        print("No valid configurations found.")
    else:
        print(f"Found {len(configs)} configurations. Top 5:")
        for i, c in enumerate(configs[:5]):
            print(f" {i+1}. [${c['cost']}] {c['frame']} + {c['motor']} + {c['prop']} | {c['battery']} | {c['esc']}")
            print(f"    -> Range: {c['range_km']:.1f}km | Time: {c['flight_time_min']:.1f}min | AUW: {c['auw_kg']:.1f}kg | Hover/Torque: {c['hover_throttle']:.1f}%")
