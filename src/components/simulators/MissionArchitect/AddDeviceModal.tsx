import React, { useState } from 'react';
import { X, Plus, Trash2, Cpu, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface Pin {
    id: string;
    name: string;
    type: 'power' | 'data' | 'control';
    polarity?: 'input' | 'output' | 'bidirectional';
}

interface AddDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    
    const [name, setName] = useState('');
    const [category, setCategory] = useState('platforms');
    const [weightKg, setWeightKg] = useState(0.5);
    const [powerDrawW, setPowerDrawW] = useState(0);
    const [operatingVoltage, setOperatingVoltage] = useState('');
    const [operatingCurrent, setOperatingCurrent] = useState('');
    const [pins, setPins] = useState<Pin[]>([]);

    if (!isOpen) return null;

    const handleAddPin = () => {
        setPins([...pins, { id: `pin_${Date.now()}`, name: 'New Pin', type: 'data', polarity: 'bidirectional' }]);
    };

    const handleRemovePin = (idx: number) => {
        setPins(pins.filter((_, i) => i !== idx));
    };

    const updatePin = (idx: number, field: keyof Pin, value: string) => {
        const newPins = [...pins];
        newPins[idx] = { ...newPins[idx], [field]: value };
        setPins(newPins);
    };

    const handleSave = async () => {
        try {
            if (!user) {
                alert("You must be logged in to add devices to the global library.");
                return;
            }

            const newProduct = {
                user_id: user.id,
                name,
                category,
                weight_kg: weightKg,
                power_draw_w: powerDrawW,
                operating_voltage: operatingVoltage,
                operating_current: operatingCurrent,
                pin_layout: { pins },
                is_active: true,
                show_on_marketplace: true,
                type: 'hardware'
            };

            const { error } = await supabase.from('products').insert([newProduct]);

            if (error) throw error;
            
            alert("Device successfully added to the catalog! Please trigger a Marketplace Re-Sync to use it.");
            onClose();
        } catch (e: any) {
            console.error("Failed adding device", e);
            alert("Failed to add device: " + e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 w-[600px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
                    <div className="flex items-center gap-2 text-sky-400 font-bold uppercase tracking-widest text-sm">
                        <Cpu className="w-5 h-5" /> Add Component to SSOT
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Component Name</label>
                            <input 
                                type="text" value={name} onChange={e => setName(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none" 
                                placeholder="e.g. RFD900x Telemetry" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Category</label>
                            <select 
                                value={category} onChange={e => setCategory(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none"
                            >
                                <option value="platforms">Airframe / Platform</option>
                                <option value="propulsion">Propulsion (Motors)</option>
                                <option value="energy">Energy (Batteries)</option>
                                <option value="sensors">Sensors / Payloads</option>
                                <option value="transmission">Transmission / RF</option>
                                <option value="edge-ai">Edge Compute / GCS</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Weight (kg)</label>
                            <input 
                                type="number" step="0.01" value={weightKg} onChange={e => setWeightKg(Number(e.target.value))} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Power Draw (W)</label>
                            <input 
                                type="number" step="0.1" value={powerDrawW} onChange={e => setPowerDrawW(Number(e.target.value))} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Op. Voltage</label>
                            <input 
                                type="text" value={operatingVoltage} onChange={e => setOperatingVoltage(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none" 
                                placeholder="e.g. 12V"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Op. Current</label>
                            <input 
                                type="text" value={operatingCurrent} onChange={e => setOperatingCurrent(e.target.value)} 
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm focus:border-sky-500 outline-none" 
                                placeholder="e.g. 2A"
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 mt-4">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-xs uppercase tracking-wider text-slate-500 font-bold">Physical Pin Layout</label>
                            <button onClick={handleAddPin} className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 uppercase">
                                <Plus className="w-3 h-3" /> Add Pin
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            {pins.map((pin, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-slate-800 p-2 rounded border border-slate-700">
                                    <input 
                                        type="text" value={pin.name} onChange={e => updatePin(idx, 'name', e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-1/3 outline-none focus:border-sky-500"
                                        placeholder="Pin Name (e.g. 5V)"
                                    />
                                    <select 
                                        value={pin.type} onChange={e => updatePin(idx, 'type', e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none"
                                    >
                                        <option value="power">Power</option>
                                        <option value="data">Data</option>
                                        <option value="control">Control</option>
                                    </select>
                                    <select 
                                        value={pin.polarity} onChange={e => updatePin(idx, 'polarity', e.target.value)}
                                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none flex-1"
                                    >
                                        <option value="input">Input (RX/Sink)</option>
                                        <option value="output">Output (TX/Source)</option>
                                        <option value="bidirectional">Bi-directional</option>
                                    </select>
                                    <button onClick={() => handleRemovePin(idx)} className="text-red-400 hover:text-red-300 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {pins.length === 0 && (
                                <div className="text-center text-slate-500 text-xs py-4 border border-dashed border-slate-700 rounded">
                                    No pins added. Component will not be connectable in Architecture layout.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
                    <button onClick={handleSave} className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors shadow-lg shadow-sky-900/50">
                        <Save className="w-4 h-4" /> Save to Catalog
                    </button>
                </div>
            </div>
        </div>
    );
};
