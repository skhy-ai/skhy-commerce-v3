const fs = require('fs');
const lines = fs.readFileSync('supabase/final_consolidated_schema.sql', 'utf8').split('\n');
const targets = [
    'validate_partner_payment_info', 'update_updated_at_column', 'calculate_refund_eligible_until',
    'trigger_set_refund_eligibility', 'is_admin', 'sync_user_type_to_metadata', 'trigger_create_escrow_hold',
    'trigger_calculate_release_date', 'process_automatic_releases', 'check_and_cancel_unshipped_orders',
    'check_refund_eligibility', 'calculate_partner_metrics', 'recalculate_all_partner_metrics',
    'trigger_update_partner_metrics', 'trigger_update_metrics_on_violation', 'handle_new_user',
    'initiate_refund', 'initiate_refund_secure'
];

let output = '-- Security Fix: Search Path Constraint on Functions\n\n';

for (const target of targets) {
    let inFunction = false;
    let funcBody = '';
    // find start
    let funcRegex = new RegExp('\^CREATE (OR REPLACE )?FUNCTION( public\\.)?' + target + '\\b', 'i');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!inFunction && line.match(funcRegex)) {
            inFunction = true;
            funcBody = line + '\n';
            continue;
        }
        if (inFunction) {
            funcBody += line + '\n';
            // end condition: wait for $$ LANGUAGE plpgsql; or similar
            if (line.match(/^\$\$;$/) || line.trim() === '$$ LANGUAGE plpgsql;' || line.match(/^\$\$ LANGUAGE \w+;$/) || line.match(/^\$function\$;$/)) {
                inFunction = false;

                // Inject SET search_path = '' before AS $$ or AS $function$
                let modified = funcBody.replace(/(AS \$\$|AS \$function\$)/i, 'SET search_path = \'\'\n$1');
                output += modified + '\n\n';
                break; // done with this function, go to next target
            }
        }
    }
}

fs.writeFileSync('supabase/migrations/046_fix_function_search_paths.sql', output);
console.log('Done parsing functions: ' + output.length + ' bytes written');
