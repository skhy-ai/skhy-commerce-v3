// src/data/ndaText.ts
import { COMPANY_INFO } from '../constants/companyInfo';

export const NDA_TEXT = `
MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into by and between:

DISCLOSING / RECEIVING PARTY 1:
${COMPANY_INFO.legalName} (Reg No: ${COMPANY_INFO.registrationNo}), operating under the commercial brand ${COMPANY_INFO.name}, having its principal place of business at ${COMPANY_INFO.hq.formattedAddress} ("SKHY AI"),

AND

DISCLOSING / RECEIVING PARTY 2:
The Counterparty executing this Agreement ("Counterparty").

1. Purpose
The parties wish to explore a business relationship concerning the evaluation of a potential commercial partnership, defense technology integration, payload co-development, or related collaborative transaction (the "Purpose") and in connection with this Purpose, may disclose confidential information to each other.

2. Confidential Information
"Confidential Information" means any information disclosed by either party to the other party, either directly or indirectly, in writing, orally, or by inspection of tangible objects, including but not limited to algorithms, source code, hardware designs, research data, acoustic signatures, defense specifications, financial projections, and business strategies. Confidential Information does not include information that: (a) is or becomes publicly known through no wrongful act of the Receiving Party; (b) was rightfully known to the Receiving Party prior to its disclosure without any obligation of confidentiality; (c) is independently developed by the Receiving Party without use of or reference to the Disclosing Party's Confidential Information; (d) is lawfully received from a third party without an obligation of confidentiality; or (e) is legally compelled to be disclosed, provided the Receiving Party gives reasonable prior notice to the Disclosing Party to seek a protective order.

3. Non-Disclosure Obligations
The Receiving Party shall: (a) hold the Disclosing Party's Confidential Information in strict confidence; (b) use the Confidential Information only for the Purpose; and (c) not disclose such Confidential Information to any third party without prior written consent.

4. Term
This Agreement shall remain in effect for a period of three (3) years from the Effective Date, unless terminated earlier by either party with thirty (30) days' written notice. Obligations of confidentiality shall survive termination.

5. No Warranty / Disclaimer
All Confidential Information is provided "AS IS" without any warranty, express, implied, or otherwise, regarding its accuracy, completeness, or performance. Neither party shall be obligated to enter into any further agreement or transaction by virtue of this Agreement.

6. Return of Materials
Upon written request of the Disclosing Party, the Receiving Party shall promptly return or destroy all tangible materials embodying Confidential Information (including all copies thereof) and certify such destruction in writing.

7. Remedies
The Receiving Party acknowledges that any violation or threatened violation of this Agreement may cause irreparable injury to the Disclosing Party, entitling the Disclosing Party to seek injunctive relief and specific performance, in addition to all available legal and equitable remedies.

8. Limitation of Liability
In no event shall either party be liable to the other for any indirect, incidental, consequential, special, or punitive damages arising out of or related to the disclosure or use of Confidential Information under this Agreement.

9. Force Majeure
Neither party shall be held liable or responsible to the other party nor be deemed to have defaulted under or breached this Agreement for failure or delay in fulfilling or performing any obligation under this Agreement when such failure or delay is caused by or results from causes beyond the reasonable control of the affected party.

10. Governing Law & Jurisdiction
This Agreement shall be governed by and construed in accordance with the laws of India (for Indian entity contracts) or Malaysia (for Malaysian entity contracts). Any disputes arising out of or in connection with this Agreement shall be submitted to the competent courts of the respective entity jurisdiction.
`.trim();
