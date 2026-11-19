/* MediCare+ assistant: rule-based (no API). Answers common symptoms by age group, suggests the right
   doctor with a description, and reads the logged-in patient's saved records to personalise advice.
   General guidance only, not a diagnosis. Doctor profiles are SAMPLE data for this demo. */
(function () {
  if (!document.body.dataset.chat) return;

  /* ---------- sample doctors ---------- */
  const DOCS = {
    gp:    { name: "Dr. Anil Sharma", role: "General Physician", deg: "MBBS, MD (Internal Medicine)", yrs: 15, keys: ["general physician", "physician", "gp"], treats: "fever, infections, BP, diabetes, fatigue and everyday illnesses", expect: "A full check-up, review of your history, basic tests, and a referral to a specialist if needed.", time: "Mon-Sat, 10 AM - 6 PM" },
    paed:  { name: "Dr. Anjali Kapoor", role: "Paediatrician (child specialist)", deg: "MBBS, MD (Paediatrics)", yrs: 12, keys: ["paediatric", "pediatric", "child specialist", "child doctor"], treats: "illnesses, growth and vaccines in babies, children and teens", expect: "A gentle check-up, with questions about feeding, sleep, vaccines and symptoms.", time: "Mon-Sat, 9 AM - 5 PM" },
    ent:   { name: "Dr. Imran Khan", role: "ENT Specialist", deg: "MBBS, MS (ENT)", yrs: 10, keys: ["ent specialist", "ent doctor", "ear nose"], treats: "ear, nose and throat problems, sinus, tonsils and hearing", expect: "Ear, nose and throat examination, sometimes a small scope check.", time: "Mon-Fri, 11 AM - 7 PM" },
    allergy: { name: "Dr. Rohit Malhotra", role: "Allergy & Chest Specialist", deg: "MBBS, MD (Pulmonary Medicine)", yrs: 11, keys: ["allergy specialist", "chest specialist", "pulmonolog"], treats: "allergies, asthma, long-lasting cough and breathing problems", expect: "A history of triggers, a breathing test, and sometimes allergy tests.", time: "Mon-Sat, 10 AM - 4 PM" },
    gastro: { name: "Dr. Sanjay Gupta", role: "Gastroenterologist", deg: "MBBS, MD, DM (Gastroenterology)", yrs: 14, keys: ["gastro", "stomach doctor"], treats: "stomach pain, acidity, reflux, liver and digestion problems", expect: "Questions about food and bowel habits, a tummy exam, and sometimes blood tests or a scan.", time: "Tue-Sat, 10 AM - 5 PM" },
    derm:  { name: "Dr. Neha Verma", role: "Dermatologist (skin specialist)", deg: "MBBS, MD (Dermatology)", yrs: 9, keys: ["dermatolog", "skin doctor", "skin specialist"], treats: "acne, rashes, hair and skin conditions", expect: "A close look at your skin and a routine plan for cleansing, creams or other treatment.", time: "Mon-Sat, 12 PM - 7 PM" },
    neuro: { name: "Dr. Rahul Mehta", role: "Neurologist", deg: "MBBS, MD, DM (Neurology)", yrs: 12, keys: ["neurolog", "brain doctor"], treats: "headaches and migraine, dizziness, nerve problems and seizures", expect: "A check of reflexes, balance and nerves, and sometimes a scan.", time: "Mon-Fri, 10 AM - 3 PM" },
    psy:   { name: "Dr. Priya Nair", role: "Psychiatrist & Sleep Specialist", deg: "MBBS, MD (Psychiatry)", yrs: 10, keys: ["psychiatr", "psycholog", "sleep specialist", "counsel"], treats: "stress, anxiety, low mood and sleep problems", expect: "A calm, private conversation about your feelings and routine, with talk therapy or other support.", time: "Mon-Sat, 11 AM - 6 PM" },
    ortho: { name: "Dr. Vikram Singh", role: "Orthopaedic Surgeon (bone & joint)", deg: "MBBS, MS (Orthopaedics)", yrs: 16, keys: ["orthop", "bone doctor", "joint doctor"], treats: "back pain, joint and knee pain, fractures and sports injuries", expect: "A movement and posture check, an X-ray if needed, and exercises or physiotherapy.", time: "Mon-Sat, 9 AM - 2 PM" },
    cardio: { name: "Dr. Meera Iyer", role: "Cardiologist (heart specialist)", deg: "MBBS, MD, DM (Cardiology)", yrs: 18, keys: ["cardiolog", "heart doctor", "heart specialist"], treats: "high blood pressure, cholesterol, chest pain and heart disease", expect: "BP and pulse checks, an ECG, blood tests, and a heart-healthy plan.", time: "Mon-Fri, 10 AM - 5 PM" },
    endo:  { name: "Dr. Kavita Rao", role: "Endocrinologist / Diabetologist", deg: "MBBS, MD, DM (Endocrinology)", yrs: 13, keys: ["endocrin", "diabetolog", "diabetes doctor", "sugar doctor"], treats: "diabetes, thyroid, hormones and weight problems", expect: "Sugar and HbA1c review, diet and medicine planning, and foot and eye check reminders.", time: "Mon-Sat, 10 AM - 4 PM" },
    rheum: { name: "Dr. Sunita Joshi", role: "Rheumatologist (arthritis specialist)", deg: "MBBS, MD, DM (Rheumatology)", yrs: 12, keys: ["rheumatolog", "arthritis doctor"], treats: "arthritis, joint swelling and stiffness, and autoimmune conditions", expect: "A joint exam, blood tests, and a plan to ease pain and protect your joints.", time: "Tue-Sat, 11 AM - 5 PM" },
    eye:   { name: "Dr. Arjun Das", role: "Eye Specialist (Ophthalmologist)", deg: "MBBS, MS (Ophthalmology)", yrs: 11, keys: ["ophthalmolog", "eye doctor", "eye specialist"], treats: "blurred vision, cataract, glaucoma and diabetic eye checks", expect: "A vision test, eye pressure check and a look at the back of the eye.", time: "Mon-Sat, 9 AM - 4 PM" }
  };

  /* ---------- symptom topics ----------
     n name, k keywords, a about, c care tips, s see a doctor if, d doctor, d2 extra doctor for children, g extra line per age group */
  const TOP = {
    fever:  { n: "Fever", k: ["fever", "temperature", "high temp"], a: "Fever means a body temperature above about 38°C (100.4°F). It is usually the body fighting an infection such as flu.", c: ["Rest and drink plenty of fluids", "Wear light clothes and keep the room cool", "Check the temperature every few hours", "Ask a doctor or pharmacist before taking any fever medicine"], s: "it lasts more than 3 days, goes above 39.5°C, or comes with a stiff neck, rash, confusion or trouble breathing. A baby under 3 months with fever needs a doctor immediately", d: "gp", d2: "paed" },
    cold:   { n: "Cold", k: ["cold", "runny nose", "sneez", "blocked nose", "congestion"], a: "A cold is a mild viral infection of the nose and throat. It usually clears in 7 to 10 days.", c: ["Rest and drink warm fluids", "Steam inhalation and salt-water gargles can ease symptoms", "Saline nose drops help a blocked nose", "Wash hands often to avoid spreading it"], s: "it lasts more than 10 days, you have a high fever, ear or face pain, or wheezing", d: "gp", d2: "paed" },
    cough:  { n: "Cough", k: ["cough", "phlegm"], a: "A cough is the body's way of clearing the airways. It is often from a cold, allergy, dust or smoke.", c: ["Sip warm water; honey helps older children and adults (not under 1 year)", "Avoid smoke, dust and cold drinks", "Steam can loosen phlegm", "Keep your head slightly raised when sleeping"], s: "it lasts more than 2 to 3 weeks, you cough blood, have chest pain, wheezing or breathlessness", d: "allergy", d2: "paed" },
    stomach: { n: "Stomach pain", k: ["stomach", "tummy", "abdominal", "belly", "diarrh", "loose motion", "vomit", "nausea"], a: "Stomach pain is often from indigestion, gas or a mild infection, and usually settles in a day or two.", c: ["Sip water or ORS in small amounts to avoid dehydration", "Eat light foods like rice, banana and toast", "Avoid spicy, oily food and milk for a day", "Rest and use a warm compress"], s: "the pain is severe or lasts over 2 days, there is blood in vomit or stool, you cannot keep fluids down, or pain on the lower right side comes with fever", d: "gastro", d2: "paed" },
    allergy: { n: "Allergies", k: ["allergy symptom", "allergic", "hives", "itch", "rash", "sneezing fits", "allergies"], a: "An allergy is when the body over-reacts to something like dust, pollen, food or a medicine. It can cause sneezing, itching, rashes or watery eyes.", c: ["Note what you ate or touched before the symptoms", "Avoid known triggers; wash bedding in hot water weekly", "Keep windows closed on high-pollen days", "Do not take new medicines for it without asking a doctor or pharmacist"], s: "symptoms keep coming back or hives spread. SWELLING of the lips, face or throat, or trouble breathing is an emergency: call 112 now", d: "allergy", d2: "paed" },
    acne:   { n: "Acne", k: ["acne", "pimple", "zits", "breakout"], a: "Acne is very common in teenagers because hormones make skin oilier and pores block easily.", c: ["Wash your face gently twice a day", "Do not squeeze or pick pimples; it causes scars", "Use oil-free skin and hair products", "Change pillowcases and wipe phones often"], s: "pimples are painful and deep, leave scars, or do not improve in 6 to 8 weeks", d: "derm" },
    headache: { n: "Headache", k: ["headache", "migraine", "head pain", "head ache"], a: "Most headaches come from tension, poor sleep, dehydration, skipped meals or eye strain.", c: ["Rest in a quiet, dim room and drink water", "Keep regular sleep and meal times", "Take screen breaks every 30 to 40 minutes", "Keep a note of what triggers your headaches"], s: "a headache is sudden and very severe, comes after a head injury, or comes with vomiting, vision change, weakness, confusion or a stiff neck", d: "neuro", g: { teen: "Teens: skipped meals, late nights, long screen time and exam stress are common triggers.", elder: "In older adults a NEW headache should be checked by a doctor, as it can be linked to blood pressure." } },
    sleep:  { n: "Sleep problems", k: ["sleep", "insomnia", "sleepless", "can't sleep", "cant sleep", "snoring"], a: "Poor sleep means trouble falling asleep, waking often or feeling tired after a full night.", c: ["Go to bed and wake up at the same time daily", "Avoid tea, coffee and energy drinks late in the day", "Keep the bedroom dark, quiet and cool", "Stop screens an hour before bed"], s: "poor sleep lasts more than 3 weeks, you snore loudly with pauses in breathing, or you feel very sleepy in the day", d: "psy", g: { teen: "Teens need about 8 to 10 hours. Late-night phone use is a very common cause.", elder: "Sleep changes with age. Limit daytime naps, get morning daylight, and ask your doctor if any of your medicines affect sleep." } },
    stress: { n: "Stress", k: ["stress", "anxiety", "anxious", "tension", "overwhelm", "exam pressure", "worried"], a: "Stress is the body's reaction to pressure. A little is normal, but long-term stress affects sleep, mood and health.", c: ["Try slow breathing: in for 4, hold 4, out for 6, for a few minutes", "Take a short walk or stretch daily", "Break big tasks into small steps", "Talk to someone you trust"], s: "it lasts for weeks, affects sleep, eating, studies or work, or you have panic attacks. If you ever think of harming yourself, tell someone now or call Tele-MANAS 14416 (India)", d: "psy", g: { teen: "Teens: exam, friends and social-media pressure are common causes. Talking to a parent, teacher or counsellor really helps." } },
    back:   { n: "Back pain", k: ["back pain", "backache", "back ache", "lower back", "spine"], a: "Back pain in adults is most often from poor posture, long sitting, weak muscles or a muscle strain.", c: ["Stay gently active; long bed rest makes it worse", "Sit with your back supported and take breaks every 30 minutes", "Use a warm compress and gentle stretches", "Lift objects by bending your knees"], s: "there is numbness or weakness in the legs, loss of bladder or bowel control, pain after a fall or injury, fever, or it lasts more than 2 weeks", d: "ortho" },
    acidity: { n: "Acidity", k: ["acidity", "acid", "heartburn", "gas", "bloating", "indigestion", "reflux"], a: "Acidity is a burning feeling in the chest or upper stomach when stomach acid comes back up.", c: ["Eat small, frequent meals", "Avoid spicy, oily food, soda and too much tea or coffee", "Do not lie down for 2 to 3 hours after eating", "Raise the head of your bed slightly"], s: "it lasts more than 2 weeks, you have trouble swallowing, weight loss, black stools or vomiting blood", d: "gastro" },
    fatigue: { n: "Fatigue (tiredness)", k: ["fatigue", "tired", "tiredness", "weakness", "low energy", "exhausted"], a: "Constant tiredness can come from poor sleep, stress, low iron, thyroid problems, diabetes or an unhealthy routine.", c: ["Keep a regular sleep schedule", "Eat balanced meals with protein, fruit, vegetables and iron-rich foods", "Drink enough water and do light exercise", "Reduce caffeine and screen time at night"], s: "it lasts more than 2 weeks, or comes with weight change, breathlessness, paleness or low mood. Blood tests (haemoglobin, thyroid, sugar) may be needed", d: "gp" },
    obesity: { n: "Obesity / weight", k: ["obese", "obesity", "overweight", "weight loss", "lose weight", "weight gain", "belly fat"], a: "Obesity means too much body fat for good health. It raises the risk of diabetes, high BP and joint problems.", c: ["Eat smaller portions, more vegetables and fibre, and fewer sugary drinks", "Aim for 30 minutes of activity on most days", "Sleep 7 to 8 hours", "Set slow goals, about 0.5 to 1 kg a week"], s: "you want to lose weight, especially if you have diabetes or high BP. Avoid crash diets; a doctor and dietitian can plan safely", d: "endo" },
    bp:     { n: "Blood pressure (BP)", k: ["bp", "blood pressure", "hypertension"], a: "High blood pressure often has no symptoms but strains the heart and blood vessels over time.", c: ["Cut down on salt, pickles and processed food", "Walk or exercise 30 minutes most days", "Keep a healthy weight; avoid smoking and limit alcohol", "Take BP medicines every day as prescribed and check BP regularly"], s: "your readings are often 140/90 or higher. Very high BP with chest pain, severe headache, vision change or weakness is an emergency: call 112", d: "cardio", g: { parent: "At this age, check BP at least every few months, even if you feel fine.", elder: "For elderly people, stand up slowly, as BP medicines can cause dizziness and falls." } },
    diabetes: { n: "Diabetes", k: ["diabetes", "blood sugar", "sugar level", "high sugar", "diabetic"], a: "Diabetes means the body cannot control blood sugar properly. Good control prevents problems in the eyes, kidneys, nerves and heart.", c: ["Eat balanced meals at regular times and limit sugar", "Walk after meals and exercise regularly", "Check sugar as your doctor advised and never skip medicines", "Check your feet daily; get HbA1c tested about every 3 months"], s: "you have extreme thirst, frequent urination, blurred vision, wounds that do not heal, or very high readings. Shaking, sweating or confusion may be LOW sugar: take sugar and get help", d: "endo" },
    joint:  { n: "Joint pain", k: ["joint pain", "joints", "knee pain", "knee", "joint swelling"], a: "Joint pain is common with age, overuse, extra weight or injury, and may also come from arthritis.", c: ["Balance rest with gentle movement", "Use a warm compress for stiffness", "Try low-impact exercise like walking or swimming", "Keep a healthy weight and eat calcium and vitamin D foods"], s: "the joint is swollen or red, pain lasts over 2 weeks, morning stiffness lasts over 30 minutes, or walking is hard", d: "ortho" },
    cholesterol: { n: "Cholesterol", k: ["cholesterol", "lipid", "triglyceride"], a: "High cholesterol has no symptoms, but it can block blood vessels and raise the risk of heart attack and stroke.", c: ["Eat less fried food, ghee, butter and processed snacks", "Eat more oats, fruits, vegetables and nuts", "Exercise regularly and avoid smoking", "Get a lipid profile blood test as your doctor advises"], s: "you have a family history of heart disease or high results. Chest pain or pressure is an emergency: call 112", d: "cardio" },
    arthritis: { n: "Arthritis", k: ["arthritis", "stiff joints", "joint stiffness", "stiffness"], a: "Arthritis causes pain and stiffness in the joints and is common in older age.", c: ["Do gentle movement daily and try physiotherapy", "Warm baths or compresses ease stiffness", "Wear supportive footwear and keep floors non-slippery to avoid falls", "Keep a healthy weight"], s: "joints are swollen, deformed or very painful, or daily tasks are becoming difficult", d: "rheum" },
    vision: { n: "Vision problems", k: ["vision", "eyesight", "blurred", "blurry", "blur", "cataract", "glasses", "eye", "cannot see"], a: "Vision changes are common with age (reading difficulty, cloudy lenses) and may also come from diabetes or high BP.", c: ["Get your eyes checked every year after 40, and yearly if you have diabetes", "Use good lighting for reading", "Wear sunglasses outdoors", "Do not use eye drops without a doctor's advice"], s: "vision gets blurry, patchy or dim over time. SUDDEN vision loss, flashes of light or severe eye pain need urgent care today", d: "eye" }
  };

  const GROUPS = {
    gen:    { label: "Children & general", topics: ["fever", "cold", "cough", "stomach", "allergy"] },
    teen:   { label: "Teenagers", topics: ["acne", "headache", "sleep", "stress"] },
    adult:  { label: "Adults", topics: ["back", "acidity", "fatigue", "obesity", "stress"] },
    parent: { label: "Parents (40+)", topics: ["bp", "diabetes", "joint", "cholesterol"] },
    elder:  { label: "Elderly", topics: ["arthritis", "vision", "bp", "sleep"] }
  };
  const gOf = { gen: "gen", teen: "teen", adult: "adult", parent: "parent", elder: "elder" };
  const MAIN = [...Object.values(GROUPS).map(g => g.label), "Doctor details"];

  /* ---------- UI ---------- */
  const u = user(), first = u ? u.name.split(" ")[0] : "there";
  const box = document.createElement("div");
  box.innerHTML = `<button id="cb-btn" aria-label="Open health assistant">💬</button>
  <section id="cb" role="dialog" aria-label="Health assistant"><header>MediCare+ Assistant<small>General guidance only, not a diagnosis</small></header>
  <div id="cb-log" aria-live="polite"></div><div class="qr" id="qr"></div>
  <form id="cb-f"><input id="cb-i" placeholder="Type a symptom, e.g. headache" autocomplete="off"><button class="btn sm">Send</button></form></section>`;
  document.body.appendChild(box);
  const log = document.getElementById("cb-log"), inp = document.getElementById("cb-i"), win = document.getElementById("cb"), qr = document.getElementById("qr");
  const add = (t, c) => { const d = document.createElement("div"); d.className = "m " + c; d.textContent = t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
  const setQR = a => qr.innerHTML = a.map(c => `<button type="button">${c}</button>`).join("");
  setQR(MAIN);

  /* ---------- helpers ---------- */
  const isPatient = () => { const x = user(); return !!x && x.role !== "doctor"; };
  let group = null, lastDoc = null;
  const docCard = k => { const d = DOCS[k]; lastDoc = k;
    return `${d.name}\n${d.role}\nQualification: ${d.deg}\nExperience: ${d.yrs} years\nTreats: ${d.treats}\nWhat to expect: ${d.expect}\nTimings: ${d.time}\n(Sample profile for this demo. Please confirm timings with the clinic.)`; };
  const docLine = k => `${DOCS[k].name}, ${DOCS[k].role}`;
  const findTopic = s => { let best = null, len = 0;
    for (const [id, t] of Object.entries(TOP)) for (const k of t.k) { if (new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(s) && k.length > len) { best = id; len = k.length; } }
    return best; };
  const detectGroup = s => /teen|adolescen/.test(s) ? "teen" : /elder|senior|old age|grandf|grandm|grandp/.test(s) ? "elder" : /\badult\b/.test(s) ? "adult" : /parent|mother|father|\bmom\b|\bdad\b/.test(s) ? "parent" : /child|kid|baby|\bson\b|daughter/.test(s) ? "gen" : null;

  function personal(id, d) {
    if (!d) return "";
    const out = [], al = ofType(d, "allergy"), cd = ofType(d, "condition").map(c => c.title.toLowerCase()).join(" ");
    if (al.length && ["fever", "cold", "cough", "stomach", "allergy", "headache", "back", "acidity", "joint", "arthritis"].includes(id)) out.push(`Your record shows an allergy to ${al.map(a => a.title).join(", ")}. Tell the doctor or pharmacist before taking any medicine.`);
    if (/diabet/.test(cd) && ["fever", "cold", "cough", "stomach", "fatigue", "vision"].includes(id)) out.push("You have diabetes in your record, so check your sugar more often while unwell and see a doctor sooner if it stays high.");
    if (/hypertension|pressure/.test(cd) && ["bp", "headache"].includes(id)) out.push("Hypertension is in your record. Keep taking your BP medicines as prescribed.");
    if (id === "diabetes" && d.sugar.length) out.push(`Your last saved sugar reading is ${d.sugar[d.sugar.length - 1]} mg/dL.`);
    return out.length ? "\nFor you (from your records):\n" + out.map(x => "• " + x).join("\n") : "";
  }

  /* Save the symptom chat straight into the patient's History (browser localStorage) */
  function saveChat(id) {
    if (!user()) return "\n\nLog in to save this to your history.";
    if (!isPatient()) return "";
    const t = TOP[id], d = load(), day = today(), title = t.n + " (chatbot)";
    if (d.history.some(h => h.src === "chat" && h.title === title && h.date === day)) return "\n\n✓ Already saved in your History today.";
    d.history.push({ id: Date.now(), type: "symptom", title, date: day, src: "chat",
      note: `Asked the chatbot${group ? " (" + GROUPS[group].label + ")" : ""}. Suggested doctor: ${docLine(t.d)}. See a doctor if ${t.s}.` });
    save(d);
    return "\n\n✓ Saved to your History as a symptom record. Your doctor can see it.";
  }

  function answerTopic(id) {
    const t = TOP[id], g = group && t.g && t.g[group];
    lastDoc = t.d;
    setQR(["Doctor details", "Other problems", "Change age group"]);
    return `${t.n}\n${t.a}\n${g ? "\n" + g + "\n" : ""}\nWhat you can do:\n${t.c.map(x => "• " + x).join("\n")}\n\nSee a doctor if ${t.s}.\n\nDoctor to see: ${docLine(t.d)}.` +
      (t.d2 ? `\nFor a child: ${docLine(t.d2)}.` : "") + personal(id, isPatient() ? load() : null) + "\n\nThis is general information, not a diagnosis." + saveChat(id);
  }

  /* ---------- main reply ---------- */
  function reply(t) {
    const s = t.toLowerCase().trim(), has = (...w) => w.some(x => s.includes(x));
    const d = isPatient() ? load() : null, needLogin = "Please log in first so I can read your records.";

    if (has("emergency", "chest pain", "can't breathe", "cannot breathe", "difficulty breathing", "faint", "unconscious", "stroke", "heart attack", "suicid"))
      return "This could be serious. Please call your local emergency number (112 in India) or go to the nearest hospital right now. If you are thinking of harming yourself, call Tele-MANAS 14416 (India) or tell someone near you now.";
    if (/^(hi|hello|hey)\b/.test(s)) return `Hello ${first}! Pick an age group below or type a symptom like fever, headache, back pain or BP. I can also tell you which doctor to see.`;
    if (has("change age group", "other problems")) { group = null; setQR(MAIN); return "Choose an age group or type your symptom."; }

    for (const [k, g] of Object.entries(GROUPS)) if (s === g.label.toLowerCase()) {
      group = gOf[k]; setQR([...g.topics.map(x => TOP[x].n), "Doctor details", "Change age group"]);
      return `${g.label}: common problems I can help with are ${g.topics.map(x => TOP[x].n.toLowerCase()).join(", ")}. Tap one or type your symptom.`;
    }
    const dg = detectGroup(s); if (dg) group = dg;

    /* a specific specialist, e.g. "tell me about cardiologist" */
    for (const [k, doc] of Object.entries(DOCS)) if (doc.keys.some(w => new RegExp("\\b" + w).test(s))) return docCard(k);

    /* saved-record questions */
    if (has("my medicine", "my medication", "my tablet")) {
      if (!d) return needLogin; const m = ofType(d, "medicine");
      return m.length ? "Your saved medicines:\n" + m.map(x => `• ${x.title} (${x.note || "no note"})`).join("\n") + "\nNever change a dose without asking your doctor." : "No medicines saved. Add them on the History page.";
    }
    if (has("my allerg", "saved allerg")) {
      if (!d) return needLogin; const a = ofType(d, "allergy");
      return a.length ? `Your record lists: ${a.map(x => x.title).join(", ")}. Tell every doctor and pharmacist before taking any new medicine.` : "No allergies are saved in your record. If you have any, add them on the History page.";
    }
    if (has("my result", "latest result", "my report", "my test", "hba1c")) {
      if (!d) return needLogin; const tests = sorted(ofType(d, "test")), sg = d.sugar, o = [];
      if (sg.length) o.push(`• Latest blood sugar: ${sg[sg.length - 1]} mg/dL`);
      if (tests.length) o.push(`• Latest test: ${tests[0].title} on ${fmt(tests[0].date)}. ${tests[0].note}`);
      return o.length ? "Your latest results:\n" + o.join("\n") + "\nYour doctor will explain what they mean." : "No results saved yet. Add a test on History or log a sugar reading on the Dashboard.";
    }
    if (has("last visit", "my visit")) {
      if (!d) return needLogin; const v = sorted(ofType(d, "visit"));
      return v.length ? `Your last saved visit: ${v[0].title} on ${fmt(v[0].date)}. This demo cannot book appointments, so please contact the clinic.` : "No visits saved yet. Add one on the History page.";
    }

    /* symptom topics (also matches the quick-reply buttons) */
    let id = findTopic(s);
    if (!id) for (const [k, t] of Object.entries(TOP)) if (t.n.toLowerCase() === s) id = k;
    if (id) return has("doctor", "specialist", "who should", "which doc") ? `For ${TOP[id].n.toLowerCase()}, see:\n\n${docCard(TOP[id].d)}` + (TOP[id].d2 ? `\n\nFor a child: ${docLine(TOP[id].d2)}.` : "") : answerTopic(id);

    if (has("doctor details", "doctor detail", "which doctor", "who should i see")) return lastDoc ? docCard(lastDoc) : "Tell me your symptom first (for example fever or back pain), and I will show the right doctor. Or ask about a specialist such as a cardiologist.";
    if (has("list doctors", "all doctors", "doctors", "specialist")) return "Doctors in this demo:\n" + Object.values(DOCS).map(x => `• ${x.name} - ${x.role}`).join("\n") + "\nAsk \"tell me about cardiologist\" for full details.";
    if (has("medicine", "medication", "tablet")) return d ? reply("my medicines") : needLogin;
    if (has("diet", "food", "eat")) return "Healthy eating basics:\n• Whole grains, vegetables, fruit and pulses\n• Less sugar, salt and fried food\n• Enough water and regular meal times\nFor a plan fitted to your condition, ask for a diet, e.g. \"diabetes\" or \"BP\".";
    if (has("exercise", "walk", "workout")) return "A 30-minute brisk walk on most days is good for most people. Stop and rest if you feel dizzy, and ask your doctor if unsure.";
    if (has("pain", "ache", "hurt")) return "Where is the pain? Tell me: head, stomach, back, joints, eyes or chest. (Chest pain with sweating or breathlessness is an emergency: call 112.)";
    if (has("thank")) return "You're welcome! Stay healthy.";
    return "I'm not sure about that. Try a symptom like fever, cold, cough, stomach pain, acne, headache, back pain, BP or diabetes, or pick an age group below. For anything urgent, contact a doctor.";
  }

  const send = t => { if (!t.trim()) return; add(t, "me"); setTimeout(() => add(reply(t), "bot"), 450); };
  document.getElementById("cb-btn").onclick = () => {
    win.classList.toggle("open");
    if (win.classList.contains("open") && !log.children.length) add(`Hi ${first}! I'm your health assistant. Choose an age group or type a symptom, and I will give simple advice and tell you which doctor to see.`, "bot");
    inp.focus();
  };
  qr.onclick = e => { if (e.target.tagName === "BUTTON") send(e.target.textContent); };
  document.getElementById("cb-f").onsubmit = e => { e.preventDefault(); send(inp.value); inp.value = ""; };
})();
