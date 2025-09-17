# LAST WILL AND TESTAMENT
## (Posledná vôľa a závet)

---

**I, {{testatorName}}**, born on {{birthDate}} in {{birthPlace}}, with personal identification number {{personalId}}, currently residing at {{address}}, citizen of {{citizenship}}, being of sound mind and under no constraint or undue influence, do hereby make, publish, and declare this to be my Last Will and Testament, hereby revoking any and all former Wills and Codicils by me at any time heretofore made.

---

### ARTICLE I - DECLARATION AND REVOCATION

I declare that I am {{age}} years old and of sound mind. I make this Will voluntarily and am not acting under duress, fraud, or undue influence of any person whomsoever.

I hereby revoke all prior Wills and Codicils made by me.

{{#if willType.holographic}}
**This is a holographic will** written entirely in my own hand and signed by me, as permitted under § 476 of the Slovak Civil Code.
{{/if}}

{{#if willType.witnessed}}
**This will is made in the presence of witnesses** as permitted under § 477 of the Slovak Civil Code.
{{/if}}

---

### ARTICLE II - FAMILY STATUS

{{#if spouse}}
I am {{maritalStatus}} to {{spouseName}}.
{{/if}}

{{#if children}}
I have the following children:
{{#each children}}
- {{name}}, born {{birthDate}}{{#if isMinor}} (minor){{/if}}
{{/each}}
{{else}}
I have no children.
{{/if}}

---

### ARTICLE III - ASSETS AND PROPERTY

I own the following assets and property:

{{#if realEstate}}
**Real Estate:**
{{#each realEstate}}
- {{type}} located at {{address}}, Cadastral Number: {{cadastralNumber}}, my ownership share: {{ownership}}, estimated value: €{{estimatedValue}}
{{/each}}
{{/if}}

{{#if bankAccounts}}
**Bank Accounts:**
{{#each bankAccounts}}
- {{accountType}} account at {{bank}}, account ending in {{accountNumber}}, approximate balance: €{{approximateBalance}}
{{/each}}
{{/if}}

{{#if vehicles}}
**Vehicles:**
{{#each vehicles}}
- {{year}} {{make}} {{model}}, license plate {{licensePlate}}, estimated value: €{{estimatedValue}}
{{/each}}
{{/if}}

{{#if personalProperty}}
**Personal Property:**
{{#each personalProperty}}
- {{description}}, currently located at {{location}}, estimated value: €{{estimatedValue}}
{{/each}}
{{/if}}

---

### ARTICLE IV - BEQUESTS AND DISTRIBUTIONS

{{#if forcedHeirsNotice}}
**NOTICE REGARDING FORCED HEIRS:**
Under Slovak law, the following persons are entitled to forced inheritance shares:
{{#if spouse}}
- My spouse {{spouseName}} is entitled to at least 1/4 of my estate
{{/if}}
{{#if minorChildren}}
- My minor children are entitled to at least 1/2 of their normal legal inheritance share
{{/if}}
{{#if adultChildren}}
- My adult children are entitled to at least 1/2 of their normal legal inheritance share
{{/if}}

The distributions below respect these mandatory provisions.
{{/if}}

I give, devise, and bequeath my property as follows:

{{#each beneficiaries}}
**To {{name}}** ({{relationship}}), residing at {{address}}, Personal ID/Birth Date: {{personalId}}:
{{#if percentage}}
- {{percentage}}% of my entire estate
{{/if}}
{{#if specificAssets}}
- The following specific assets: {{specificAssets}}
{{/if}}
{{#if amount}}
- The monetary sum of €{{amount}}
{{/if}}
{{#if conditions}}
- Subject to the following conditions: {{conditions}}
{{/if}}

{{/each}}

{{#if charitableBequests}}
**CHARITABLE BEQUESTS:**
{{#each charitableBequests}}
- To {{organization}}: €{{amount}} for {{purpose}}
{{/each}}
{{/if}}

**RESIDUARY CLAUSE:**
All the rest, residue, and remainder of my estate, both real and personal, of every kind and nature and wheresoever situate, I give, devise, and bequeath to {{residuaryBeneficiary}} in equal shares, or to their survivors per stirpes.

---

### ARTICLE V - EXECUTOR

{{#if hasExecutor}}
I hereby nominate and appoint **{{executorName}}**, residing at {{executorAddress}}, as the Executor of this my Last Will and Testament.

{{#if backupExecutor}}
If {{executorName}} is unable or unwilling to serve, I nominate **{{backupExecutor}}** as alternate Executor.
{{/if}}

I direct that my Executor shall not be required to give bond for the faithful performance of duties as Executor.

My Executor shall have all powers granted by Slovak law, including but not limited to:
- The power to sell, transfer, and dispose of any and all assets
- The power to pay all debts, taxes, and expenses of administration
- The power to distribute assets to beneficiaries
- The power to represent my estate in legal proceedings

{{else}}
I do not appoint an Executor. The administration of my estate shall proceed according to Slovak law.
{{/if}}

---

{{#if hasMinorChildren}}
### ARTICLE VI - GUARDIANSHIP

{{#if primaryGuardian}}
I nominate **{{primaryGuardian.name}}**, residing at {{primaryGuardian.address}}, as Guardian of the person and property of any of my minor children.

{{#if backupGuardian}}
If {{primaryGuardian.name}} is unable or unwilling to serve, I nominate **{{backupGuardian.name}}**, residing at {{backupGuardian.address}}, as alternate Guardian.
{{/if}}

{{#if guardianshipInstructions}}
**Instructions for Guardians:**
{{guardianshipInstructions}}
{{/if}}
{{/if}}

---
{{/if}}

### ARTICLE VII - SPECIAL WISHES AND INSTRUCTIONS

{{#if funeralWishes}}
**Funeral and Burial Instructions:**
{{funeralWishes}}
{{/if}}

{{#if organDonation}}
**Organ Donation:**
{{#if organDonation.yes}}
I wish to donate my organs for transplantation and medical research.
{{/if}}
{{#if organDonation.no}}
I do not wish to donate my organs.
{{/if}}
{{#if organDonation.family_decides}}
I leave the decision about organ donation to my family.
{{/if}}
{{/if}}

{{#if digitalAssets}}
**Digital Assets and Accounts:**
{{digitalAssets}}
{{/if}}

{{#if personalMessages}}
**Personal Messages:**
{{#each personalMessages}}
To {{recipient}}: {{message}}

{{/each}}
{{/if}}

---

### ARTICLE VIII - FINAL PROVISIONS

This Will shall be construed and governed by the laws of the Slovak Republic.

If any provision of this Will is deemed invalid or unenforceable, the remaining provisions shall remain in full force and effect.

I have carefully read this Will, and it correctly reflects my wishes and intentions.

---

### EXECUTION

{{#if willType.holographic}}
**HOLOGRAPHIC WILL EXECUTION:**
This entire Will has been written in my own handwriting and is signed by me on this {{currentDate}}.

**IMPORTANT INSTRUCTIONS FOR YOU:**
To make this will legally valid under Slovak law, you must:
1. Copy this entire text in your own handwriting on paper
2. Sign it with your full signature
3. Date it when you sign
4. Store it in a safe place and inform your executor or trusted family member of its location

Signature: ________________________
{{testatorName}}

Date: ____________________________
{{/if}}

{{#if willType.witnessed}}
**WITNESSED WILL EXECUTION:**
I have signed this Will in the presence of the witnesses whose signatures appear below, and they have signed this Will in my presence and in the presence of each other.

Testator's Signature: ________________________    Date: ____________________
{{testatorName}}

**WITNESSES:**
We, the undersigned witnesses, each declare that:
- The testator signed this Will in our presence
- We believe the testator to be of sound mind
- We are both present at the same time
- Neither of us is a beneficiary of this Will
- We are both over 18 years of age and legally competent

Witness 1 Signature: ________________________    Date: ____________________
Print Name: ________________________
Address: ________________________

Witness 2 Signature: ________________________    Date: ____________________
Print Name: ________________________ 
Address: ________________________

**IMPORTANT INSTRUCTIONS FOR EXECUTION:**
To make this will legally valid under Slovak law, you must:
1. Print this document
2. Sign it in the presence of two qualified witnesses
3. Have both witnesses sign simultaneously in your presence
4. Ensure witnesses meet Slovak legal requirements (adults, mentally capable, not beneficiaries)
5. Store the original in a safe place and inform your executor of its location
{{/if}}

---

*This will was generated using LegacyGuard's intelligent will creation system. While this template complies with Slovak legal requirements, we recommend having it reviewed by a qualified Slovak attorney to ensure it meets your specific needs and circumstances.*

**Legal Disclaimer:** This document is generated based on current Slovak law. Laws may change, and individual circumstances may require specific legal advice. Consult with a qualified Slovak attorney for personalized legal guidance.