/* All simulation state is in memory. The check-up is stored only on explicit Save. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const all = selector => [...document.querySelectorAll(selector)];
  document.body.classList.add('cs-ready');
  const notices = all('[data-notice]');
  notices.forEach(b => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      notices.forEach(n => n.setAttribute('aria-pressed', String(n === b)));
      $('cs-notice-feedback').textContent = b.dataset.notice === 'security'
        ? 'The uninitiated sign-in needs a secure response: deny it, then investigate or report through a known channel. This protects account confidentiality and integrity.'
        : 'That update may matter, but look for a request that would grant access to an account. You can try again without penalty.';
    });
  });
  $('cs-quiet').onclick = () => {
    const quiet = $('cs-quiet').getAttribute('aria-pressed') !== 'true';
    $('cs-quiet').setAttribute('aria-pressed', String(quiet));
    $('cs-quiet').textContent = quiet ? 'Restore all notifications' : 'Compare a quieter view';
    notices.forEach(n => n.hidden = quiet && n.dataset.notice !== 'security');
    $('cs-notice-feedback').textContent = quiet
      ? 'Five routine updates are hidden; the unexpected sign-in remains. Is it easier to notice? Knowing the answer also helps, so this is a design comparison, not a test result.'
      : 'All six messages are visible again. Keep essential security messages reachable when changing real notification settings.';
  };
  $('cs-notice-reset').onclick = () => {
    notices.forEach(n => { n.hidden = false; n.setAttribute('aria-pressed','false'); });
    $('cs-quiet').setAttribute('aria-pressed','false');
    $('cs-quiet').textContent = 'Compare a quieter view';
    $('cs-notice-feedback').textContent = 'Choose a notification, or open the written debrief below.';
  };
  const chains = {
    urgent: ['Environment: a message threatens to close your account. Intervention: institutions provide trusted reporting and clear account notices.', 'Cognition: time pressure may narrow deliberation. Intervention: pause and treat urgency as a reason to verify.', 'Behaviour: you might enter credentials through the message link. Intervention: open the known service independently.', 'IS consequence: stolen credentials could expose records or enable lockout (confidentiality/availability). Intervention: layered access controls and rapid reporting reduce harm.'],
    switching: ['Environment: notifications compete with an invoice review. Intervention: batch optional updates and protect review time.', 'Cognition: attention shifts and the reviewer must recover context. Intervention: show a clear change summary and allow time to recheck.', 'Behaviour: a changed bank account may be skimmed over. Intervention: compare the approved record and independently verify.', 'IS consequence: an unauthorized payment change compromises integrity. Intervention: require independent approval; do not rely on perfect attention.'],
    fatigue: ['Environment: many similar approval requests arrive. Intervention: remove redundant prompts and distinguish sensitive actions.', 'Cognition: weariness or familiarity may encourage automatic responses. Intervention: clear consequences and manageable security demands.', 'Behaviour: an uninitiated login may be approved to clear the screen. Intervention: deny and report through a known route.', 'IS consequence: an attacker could read, change or delete records (CIA). Intervention: usable, phishing-resistant authentication where feasible and restricted privileges.'],
    ai: ['Environment: a fluent AI answer says a payment change is safe. Intervention: show source evidence and uncertainty.', 'Cognition: confidence in the tool may be mistaken for evidence. Intervention: ask what the model actually verified.', 'Behaviour: a reviewer may accept the claim without checking authority. Intervention: use established supplier verification and a second approver.', 'IS consequence: an unauthorized or incorrect record threatens integrity. Intervention: keep AI read-only for this task and enforce approval outside the model.']
  };
  let chainStep = 0;
  function chain() {
    $('cs-chain-result').textContent = chains[$('cs-scenario').value][chainStep];
    all('[data-chain]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.chain === chainStep)));
  }
  all('[data-chain]').forEach(b => b.onclick = () => { chainStep = +b.dataset.chain; chain(); });
  $('cs-scenario').onchange = () => { chainStep = 0; chain(); };
  const prompts = ['Save your preferred text size on this device?', 'Remember the lesson’s colour theme on this device?', 'Keep your reading position on this device?', 'Approve a new sign-in to the café’s payroll account? You did not initiate it.'];
  let step = 0, choices = [];
  function drawPrompt() {
    $('cs-prompt-count').textContent = `Prompt ${step + 1} of 4`;
    $('cs-prompt-text').textContent = prompts[step];
  }
  function respond(allow) {
    choices.push(allow); 
    if (step === 3) {
      $('cs-fatigue-feedback').textContent = (allow
        ? 'You selected Allow for a login you did not initiate. In a real service, deny and report that request; if already approved, promptly contact support through a trusted route.'
        : 'You paused or declined the unexpected login. In a real service, deny it and report through a trusted route.') + ' No permission was granted here. Did repetition affect how you read? Four prompts do not measure fatigue. Designers and organisations must reduce needless decisions and support safe pauses.';
      $('cs-allow').disabled = $('cs-deny').disabled = true;
      $('cs-prompt-count').textContent = 'Simulation complete · No score';
      // Keep focus on an enabled control after ending the sequence.
      $('cs-fatigue-reset').focus({preventScroll:true});
    } else {
      step += 1;
      drawPrompt();
      $('cs-fatigue-feedback').textContent = `Simulation only: you ${allow ? 'allowed' : 'declined'} prompt ${step}. Next request: ${prompts[step]}`;
    }
  }
  $('cs-allow').onclick = () => respond(true);
  $('cs-deny').onclick = () => respond(false);
  $('cs-fatigue-reset').onclick = () => {
    step = 0; choices = []; drawPrompt();
    $('cs-allow').disabled = $('cs-deny').disabled = false;
    $('cs-fatigue-feedback').textContent = 'Restarted. Take your time reading each request; there is no score.';
  };
  all('[data-ai]').forEach(b => b.onclick = () => {
    const a = b.dataset.ai.startsWith('a');
    $(a ? 'cs-ai-a' : 'cs-ai-b').textContent = a
      ? (b.dataset.ai === 'a-act' ? 'Pause before acting. ' : 'Yes—require independent evidence. ') + 'Branding and language do not establish payment authority. Verify the change through the established supplier contact.'
      : (b.dataset.ai === 'b-act' ? 'Use this bounded recommendation to guide a check. ' : 'B does not authorize a payment. ') + 'It flags a discrepancy; an accountable person must still verify and follow the approval process.';
  });
  const planKey = 'lesson6-cognitive-plan-v1';
  const suggestions = {
    attention: 'When checking a consequential change, I will pause optional alerts and recheck the source. I need a protected review window to support integrity.',
    prompts: 'When a prompt appears, I will read what it authorizes and deny uninitiated logins. I need fewer redundant prompts and an easy reporting route to protect account access.',
    pressure: 'When I am tired or rushed, I will request a pause or a second reviewer. I need realistic workloads and support for delaying unsafe actions.',
    ai: 'When AI recommends action, I will check its evidence and authority. I need approved tools, visible sources and limited permissions to protect confidentiality and integrity.',
    support: 'Before an urgent request arrives, I will find the official verification and reporting routes. I need clear contacts and support without blame.'
  };
  const demands = all('.cs-demand');
  const selected = () => demands.filter(x => x.checked).map(x => x.value);
  function habits() {
    const values = selected();
    $('cs-habits').replaceChildren();
    const title = document.createElement('p');
    title.textContent = values.length ? 'Possible habits—choose a realistic starting point:' : 'Choose any relevant demands to see suggested habits, or write your own plan.';
    $('cs-habits').append(title);
    if (values.length) {
      const list = document.createElement('ul');
      values.forEach(k => { const li = document.createElement('li'); li.textContent = suggestions[k]; list.append(li); });
      $('cs-habits').append(list);
    }
  }
  function changed() { $('cs-plan-status').textContent = 'Changes are in memory only. Use Save to update a saved copy, or download your plan.'; }
  demands.forEach(c => c.onchange = () => { habits(); changed(); });
  $('cs-plan').addEventListener('input', changed);
  $('cs-use-habits').onclick = () => {
    const text = selected().map(k => suggestions[k]).join('\n\n');
    if (!text) { $('cs-plan-status').textContent = 'Choose a demand above first, or write your own plan.'; return; }
    $('cs-plan').value += ($('cs-plan').value ? '\n\n' : '') + text + '\n\nI will review this after: ___. I will look for: ___.';
    changed();
  };
  function clearPlan() {
    demands.forEach(c => c.checked = false); $('cs-plan').value = ''; habits();
    try { localStorage.removeItem(planKey); $('cs-plan-status').textContent = 'Check-up and saved copy cleared. Downloaded copies are separate.'; }
    catch { $('cs-plan-status').textContent = 'Current check-up cleared. Browser storage is inaccessible; a previous saved copy could not be checked or removed.'; }
  }
  $('cs-clear-plan').onclick = clearPlan;
  window.addEventListener('lesson-reset', clearPlan);
  $('cs-save-plan').onclick = () => {
    try {
      localStorage.setItem(planKey, JSON.stringify({demands:selected(), plan:$('cs-plan').value}));
      $('cs-plan-status').textContent = 'Saved only in this browser profile. Save again after edits. Clear removes this saved copy.';
    } catch { $('cs-plan-status').textContent = 'Saving is unavailable. Download your private plan before closing.'; }
  };
  try {
    const saved = JSON.parse(localStorage.getItem(planKey));
    if (saved && typeof saved === 'object') {
      demands.forEach(c => c.checked = Array.isArray(saved.demands) && saved.demands.includes(c.value));
      $('cs-plan').value = typeof saved.plan === 'string' ? saved.plan : '';
      habits(); $('cs-plan-status').textContent = 'Loaded your explicitly saved check-up from this browser. Edits require saving again.';
    }
  } catch { /* The page remains usable with no storage. */ }
  function planText() {
    return 'PRIVATE COGNITIVE SECURITY PLAN\nNot a score, diagnosis or course submission.\n\nDemands I selected:\n' + (selected().map(k => demands.find(c=>c.value===k).parentElement.textContent.trim()).join('\n') || '[None selected]') + '\n\nMy plan:\n' + ($('cs-plan').value || '[No plan entered]');
  }
  $('cs-download-plan').onclick = () => {
    const url = URL.createObjectURL(new Blob([planText()], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'My-Private-Cognitive-Security-Plan.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    $('cs-plan-status').textContent = 'Download requested. Keep the file private; clearing this page does not delete downloaded files.';
  };
  const printPlan = document.createElement('div');
  printPlan.className = 'cs-print-plan';
  $('cs-plan').after(printPlan);
  window.addEventListener('beforeprint', () => { printPlan.textContent = planText(); });
  // Read-all expands all written debriefs; leaving restores the user's original choices.
  let openBeforeRead = null;
  $('read-all').addEventListener('click', () => {
    const details = all('.cs-module details');
    if (document.body.classList.contains('readall')) {
      openBeforeRead = details.map(d=>d.open); details.forEach(d=>d.open=true);
    } else if(openBeforeRead) {
      details.forEach((d,i)=>d.open=openBeforeRead[i]); openBeforeRead=null;
    }
  });
  all('.cs-source-link').forEach(a => a.onclick = e => {
    e.preventDefault(); navigate('sources',false); $('cs-evidence').focus(); $('cs-evidence').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
})();
