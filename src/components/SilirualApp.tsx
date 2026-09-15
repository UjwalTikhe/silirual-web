import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Accessibility, Activity, ArrowLeft, Bell, BookOpen, Brain, Camera, Check,
  ChevronRight, CircleHelp, Clock3, Cloud, CloudOff, Gamepad2, HandHeart,
  Headphones, HeartHandshake, Home, Image as ImageIcon, Languages, LocateFixed,
  MapPin, Menu, Mic, Pause, Phone, Play, Plus, RotateCcw, Settings, ShieldCheck,
  Sparkles, Square, Star, Sun, UserRound, Users, Volume2, X, Flower2, Shapes,
  ShoppingBasket, Music, Footprints,
} from "lucide-react";
import northeastWelcome from "@/assets/northeast-welcome.jpg";
import { supabaseAuth } from "@/lib/supabase/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Role = "elder" | "family" | "caregiver";
type Stage = "welcome" | "role" | "auth" | "onboarding" | "app";
type ElderView = "today" | "games" | "memories" | "help" | "activities" | "reminders" | "routine" | "care" | "location" | "settings";
type TextSize = "normal" | "large" | "extra";

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

function ActionButton({ children, onClick, variant = "primary", disabled, type = "button", className }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" | "danger" | "warm"; disabled?: boolean; type?: "button" | "submit"; className?: string;
}) {
  return <button type={type} disabled={disabled} onClick={onClick} className={cn("app-button", `app-button-${variant}`, className)}>{children}</button>;
}

function IconBadge({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "green" | "gold" | "red" }) {
  return <span className={cn("icon-badge", `icon-badge-${tone}`)}>{children}</span>;
}

function StatusStrip() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update(); window.addEventListener("online", update); window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return <div className={cn("status-strip", !online && "status-strip-offline")} role="status">
    {online ? <Cloud size={18} /> : <CloudOff size={18} />}<span>{online ? "Saved on this device · Online" : "Offline · Your information is safe"}</span>
  </div>;
}

function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="brand-lockup"><span className={cn("brand-mark", compact && "brand-mark-small")}><HandHeart /></span><div><strong>SILIRUAL</strong>{!compact && <small>साथ, स्मृति और सुकून</small>}</div></div>;
}

function PageHeader({ title, subtitle, onBack, action }: { title: string; subtitle?: string; onBack?: () => void; action?: ReactNode }) {
  return <header className="page-header">
    <div className="page-header-row">
      {onBack && <button className="icon-button" onClick={onBack} aria-label="Go back"><ArrowLeft /></button>}
      <div className="min-w-0"><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}
    </div>
  </header>;
}

function Welcome({ onNext }: { onNext: (mode: "using" | "helping") => void }) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const languages = ["English", "हिन्दी", "অসমীয়া", "বাংলা", "नेपाली", "মৈতৈলোন्"];

  const handleLanguageSelect = (index: number) => {
    setSelectedLanguage(index);
    setShowLanguageMenu(false);
    console.log(`Language selected: ${languages[index]}`);
  };
  return <main className="welcome-screen">
    <div className="welcome-photo"><img src={northeastWelcome} alt="Green hills, river and a traditional home in North East India" width={1200} height={900} /><div className="welcome-overlay"><div className="welcome-top"><Brand /><button className="language-pill" onClick={() => setShowLanguageMenu(!showLanguageMenu)}><Languages size={20} /> {languages[selectedLanguage]} <ChevronRight size={18} /></button></div>{showLanguageMenu && <div className="language-dropdown">{languages.map((lang, i) => <button key={lang} onClick={() => handleLanguageSelect(i)}>{lang}</button>)}</div>}<div className="welcome-message"><span className="official-label"><ShieldCheck size={18} /> A safe everyday companion</span><h1>Good days begin with a little support.</h1><p>Activities, memories and gentle reminders—made simple for you and the people who care.</p></div></div></div>
    <section className="welcome-actions" aria-label="Choose how you are using SILIRUAL">
      <ActionButton onClick={() => onNext("using")}><UserRound /> I am using SILIRUAL</ActionButton>
      <ActionButton variant="secondary" onClick={() => onNext("helping")}><HeartHandshake /> I am helping someone</ActionButton>
      <p className="privacy-note"><ShieldCheck size={17} /> Your information stays private and under your control.</p>
    </section>
  </main>;
}

function RoleSelect({ mode, onChoose, onBack }: { mode: "using" | "helping"; onChoose: (r: Role) => void; onBack: () => void }) {
  const roles = mode === "using" ? [
    { id: "elder" as Role, title: "For myself", text: "Activities, reminders and familiar memories", icon: <UserRound />, tone: "primary" as const },
    { id: "family" as Role, title: "As a family member", text: "Support someone you care about", icon: <HeartHandshake />, tone: "gold" as const },
  ] : [
    { id: "family" as Role, title: "Family member", text: "Share memories and help with daily reminders", icon: <HeartHandshake />, tone: "gold" as const },
    { id: "caregiver" as Role, title: "Caregiver", text: "Support and monitor people in your care", icon: <Users />, tone: "green" as const },
  ];
  return <main className="simple-screen woven-top"><PageHeader title="How will you use SILIRUAL?" subtitle="Choose the option that feels right." onBack={onBack} />
    <div className="choice-list">{roles.map((r) => <button className="choice-card" key={r.id} onClick={() => onChoose(r.id)}><IconBadge tone={r.tone}>{r.icon}</IconBadge><span><strong>{r.title}</strong><small>{r.text}</small></span><ChevronRight /></button>)}</div>
    <div className="reassurance"><CircleHelp /><div><strong>Not sure which to choose?</strong><p>You can change this later in Settings.</p></div></div>
  </main>;
}

function Auth({ role, onContinue, onBack }: { role: Role; onContinue: () => void; onBack: () => void }) {
  const [mode, setMode] = useState<"phone" | "email">("phone"); const [sent, setSent] = useState(false); const [value, setValue] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const isDemo = !isSupabaseConfigured();
  
  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "phone" && !sent) {
        if (value.replace(/\D/g, "").length < 10) {
          setError("Please enter a valid phone number.");
          setLoading(false);
          return;
        }
        const result = await supabaseAuth.sendOTP(value);
        if (result.success) {
          setSent(true);
          setValue("");
        } else {
          setError(result.message);
        }
      } else if (mode === "phone" && sent) {
        const result = await supabaseAuth.verifyOTP(value, value, role);
        if (result.success) {
          onContinue();
        } else {
          setError(result.error || "Verification failed");
        }
      } else {
        // Email mode - continue as guest for now
        await supabaseAuth.continueAsGuest(role);
        onContinue();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuest = async () => {
    setLoading(true);
    try {
      await supabaseAuth.continueAsGuest(role);
      onContinue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  return <main className="simple-screen woven-top"><PageHeader title={sent ? "Enter your code" : "Welcome back"} subtitle={sent ? "We sent a 6-digit code to your phone." : `Continue as ${role === "elder" ? "an elder" : role === "family" ? "a family member" : "a caregiver"}.`} onBack={onBack} />
    {isDemo && <div className="demo-banner"><Sparkles /> Demo mode is on. Your information stays on this device.</div>}
    {!sent && <div className="segmented"><button className={mode === "phone" ? "active" : ""} onClick={() => {setMode("phone");setError("");}}><Phone /> Phone</button><button className={mode === "email" ? "active" : ""} onClick={() => {setMode("email");setError("");}}><UserRound /> Email</button></div>}
    <form className="form-stack" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <label>{sent ? "6-digit code" : mode === "phone" ? "Mobile number" : "Email address"}<input inputMode={sent || mode === "phone" ? "numeric" : "email"} value={value} onChange={(e) => setValue(e.target.value)} placeholder={sent ? (isDemo ? "123456" : "Enter code") : mode === "phone" ? "+91 98765 43210" : "you@example.com"} maxLength={sent ? 6 : undefined} disabled={loading} /></label>
      {mode === "email" && !sent && <label>Password<input type="password" placeholder="At least 8 characters" disabled={loading} /></label>}
      {error && <div className="error-message"><X />{error}</div>}
      <ActionButton type="submit" disabled={loading}>{loading ? "Processing..." : sent ? <><Check /> Verify and continue</> : mode === "phone" ? <><Phone /> Send code</> : <><ShieldCheck /> Log in securely</>}</ActionButton>
    </form>
    <div className="or-divider"><span>or</span></div><ActionButton variant="ghost" onClick={handleGuest} disabled={loading}>Continue without an account</ActionButton>
    <p className="support-copy">Need help? <button>Call a trusted person</button></p>
  </main>;
}

function ToggleRow({ icon, title, text, value, onChange }: { icon: ReactNode; title: string; text: string; value: boolean; onChange: () => void }) {
  return <div className="toggle-row"><IconBadge>{icon}</IconBadge><div><strong>{title}</strong><small>{text}</small></div><button className={cn("switch", value && "switch-on")} role="switch" aria-checked={value} aria-label={title} onClick={onChange}><span /></button></div>;
}

function Onboarding({ onDone, textSize, setTextSize }: { onDone: (name: string) => void; textSize: TextSize; setTextSize: (s: TextSize) => void }) {
  const [step, setStep] = useState(1); const [name, setName] = useState(""); const [selectedLanguage, setSelectedLanguage] = useState(0); const [settings, setSettings] = useState({ sound: true, haptic: true, voice: false, contrast: false, motion: false, memories: true, reminders: true, location: false, recording: false });
  const flip = (key: keyof typeof settings) => setSettings(v => ({...v, [key]: !v[key]}));
  return <main className="simple-screen woven-top onboarding-screen"><div className="progress-label"><span>Step {step} of 4</span><strong>{step * 25}% complete</strong></div><div className="progress-track"><span style={{width: `${step * 25}%`}} /></div>
    {step === 1 && <><PageHeader title="Choose your language" subtitle="You can change this at any time." /><div className="language-grid">{["English", "हिन्दी", "অসমীয়া", "বাংলা", "नेपाली", "মৈতৈলোন্"].map((l, i) => <button className={cn("language-card", selectedLanguage === i && "selected")} key={l} onClick={() => setSelectedLanguage(i)}>{selectedLanguage === i && <Check />}<strong>{l}</strong><small>{["English","Hindi","Assamese","Bengali","Nepali","Manipuri"][i]}</small></button>)}</div></>}
    {step === 2 && <><PageHeader title="Make it comfortable" subtitle="Try each option. Changes happen right away." /><section className="settings-section"><h2>Text size</h2><div className="size-picker">{(["normal","large","extra"] as TextSize[]).map((s) => <button key={s} className={textSize === s ? "selected" : ""} onClick={() => setTextSize(s)}><span className={`sample-${s}`}>Aa</span><small>{{normal:"Normal",large:"Large",extra:"Extra Large"}[s]}</small></button>)}</div></section><section className="settings-section">{[
      ["sound","Sound","Hear helpful sounds",<Volume2 />],["haptic","Vibration","Feel feedback after a tap",<Activity />],["voice","Voice instructions","Hear instructions read aloud",<Mic />],["contrast","High contrast","Make colours easier to see",<Accessibility />],["motion","Reduced motion","Use fewer moving effects",<Sparkles />]
    ].map(([k,t,d,i]) => <ToggleRow key={k as string} icon={i} title={t as string} text={d as string} value={settings[k as keyof typeof settings]} onChange={() => flip(k as keyof typeof settings)} />)}</section></>}
    {step === 3 && <><PageHeader title="What should we call you?" subtitle="This helps us make SILIRUAL feel familiar." /><div className="profile-symbol"><UserRound /></div><div className="form-stack"><label>Your name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="For example, Anima" /></label><label>Age range (optional)<select><option>Choose an age range</option><option>60–69</option><option>70–79</option><option>80 or above</option></select></label></div></>}
    {step === 4 && <><PageHeader title="You are in control" subtitle="Choose what SILIRUAL may use. You can change these later." /><section className="settings-section">{[
      ["memories","Memories","Show photos and stories shared with you",<ImageIcon />],["reminders","Reminders","Notify you about your daily plan",<Bell />],["location","Location sharing","Allow time-limited sharing when you choose",<MapPin />],["recording","Voice recording","Use your voice for simple tasks",<Mic />]
    ].map(([k,t,d,i]) => <ToggleRow key={k as string} icon={i} title={t as string} text={d as string} value={settings[k as keyof typeof settings]} onChange={() => flip(k as keyof typeof settings)} />)}</section><div className="reassurance"><ShieldCheck /><div><strong>Your privacy matters</strong><p>Nothing is shared without your permission.</p></div></div></>}
    <div className="onboarding-actions">{step > 1 && <ActionButton variant="secondary" onClick={() => setStep(step-1)}><ArrowLeft /> Back</ActionButton>}<ActionButton disabled={step === 3 && !name.trim()} onClick={() => step < 4 ? setStep(step+1) : onDone(name || "Friend")}>{step === 4 ? "Finish setup" : "Continue"}<ChevronRight /></ActionButton></div>
  </main>;
}

const games = [
  {name:"Picture Pairs", desc:"Find two pictures that match", icon:<Flower2 />, level:"Gentle · 3 rounds"},
  {name:"Shape Match", desc:"Choose the matching shape", icon:<Shapes />, level:"Gentle · 4 rounds"},
  {name:"Remember the Place", desc:"Remember where the object was", icon:<MapPin />, level:"Easy · 3 rounds"},
  {name:"Basket Count", desc:"Count familiar objects", icon:<ShoppingBasket />, level:"Easy · 4 rounds"},
  {name:"Picture and Word", desc:"Match a picture with its word", icon:<BookOpen />, level:"Gentle · 5 rounds"},
];

function PicturePairs({ onClose, gameName = "Picture Pairs" }: { onClose: () => void; gameName?: string }) {
  const [phase, setPhase] = useState<"intro"|"play"|"paused"|"result">("intro"); const cards = ["flower","star","flower","star"]; const [open, setOpen] = useState<number[]>([]); const [matched, setMatched] = useState<number[]>([]); const [help, setHelp] = useState(false);
  const choose = (i:number) => { if(open.length === 2 || open.includes(i) || matched.includes(i)) return; const next=[...open,i]; setOpen(next); if(next.length===2) setTimeout(() => { const first=next[0]; const second=next[1]; if(first !== undefined && second !== undefined && cards[first]===cards[second]) { const all=[...matched,first,second]; setMatched(all); setOpen([]); if(all.length===cards.length) setTimeout(()=>setPhase("result"),700); } else setOpen([]); },900); };
  const picture = (card:string) => card === "flower" ? <Flower2 /> : <Star />;
  const handleFeeling = (feeling: string) => {
    console.log(`User feeling: ${feeling}`);
    // Here you would save the feeling feedback
    onClose();
  };

  const handleHearInstructions = () => {
    console.log("Playing audio instructions");
    // Here you would implement text-to-speech for instructions
    // For web, you could use the Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance("Tap two cards. If the pictures are the same, you have found a pair.");
      utterance.rate = 0.85; // Slower speed for elderly users
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Text-to-speech not supported in this browser");
    }
  };
  if(phase === "intro") return <div className="game-screen"><PageHeader title={gameName} subtitle="A gentle matching activity" onBack={onClose} /><div className="game-hero-icon"><Flower2 /></div><div className="instruction-card"><BookOpen /><div><h2>How to play</h2><p>Tap two cards. If the pictures are the same, you have found a pair.</p></div></div><div className="example-pairs"><span><Flower2 /></span><span><Flower2 /></span><strong>These match!</strong></div><ActionButton variant="secondary" onClick={handleHearInstructions}><Volume2 /> Hear instructions</ActionButton><ActionButton onClick={() => setPhase("play")}><Play /> Start activity</ActionButton></div>;
  if(phase === "paused") return <div className="game-screen game-centered"><IconBadge tone="gold"><Pause /></IconBadge><h1>Activity paused</h1><p>Take all the time you need.</p><ActionButton onClick={() => setPhase("play")}><Play /> Continue</ActionButton><ActionButton variant="secondary" onClick={() => setPhase("result")}><Square /> Stop for now</ActionButton></div>;
  if(phase === "result") return <div className="game-screen game-centered"><div className="celebration">✓</div><span className="official-label">Activity complete</span><h1>Well done!</h1><p>You found all the picture pairs.</p><div className="result-stats"><div><strong>2</strong><span>Pairs found</span></div><div><strong>{help ? 1 : 0}</strong><span>Help used</span></div></div><div className="saved-note"><Check /> Saved on this device</div><h2>How did that feel?</h2><div className="feeling-row"><button onClick={() => handleFeeling("enjoyable")}>😊<small>Enjoyable</small></button><button onClick={() => handleFeeling("okay")}>🙂<small>Okay</small></button><button onClick={() => handleFeeling("difficult")}>😓<small>Difficult</small></button></div><ActionButton onClick={onClose}><Home /> Return to Games</ActionButton><ActionButton variant="secondary" onClick={() => {setMatched([]);setOpen([]);setHelp(false);setPhase("intro");}}><RotateCcw /> Play again</ActionButton></div>;
  return <div className="game-screen"><div className="game-topbar"><div><small>Round 1 of 3</small><strong>Find two matching pictures</strong></div><button className="icon-button" onClick={() => setPhase("paused")} aria-label="Pause"><Pause /></button></div><div className="progress-track"><span style={{width: matched.length ? "68%":"33%"}} /></div>{help && <div className="hint-banner"><CircleHelp /> Try turning over the top-left card first.</div>}<div className="pair-board">{cards.map((card,i)=><button key={i} onClick={()=>choose(i)} className={cn((open.includes(i)||matched.includes(i))&&"open",matched.includes(i)&&"matched")} aria-label={(open.includes(i)||matched.includes(i))?card:"Hidden card"}><span>{open.includes(i)||matched.includes(i)?picture(card):"?"}</span></button>)}</div><div className="game-controls"><button onClick={()=>setPhase("paused")}><Pause /><span>Pause</span></button><button onClick={()=>setHelp(true)}><CircleHelp /><span>Help</span></button><button onClick={()=>setPhase("result")}><Square /><span>Stop</span></button></div></div>;
}

function GamesView({ onGame }: { onGame: (gameName: string) => void }) { return <><PageHeader title="Games" subtitle="Choose a gentle activity. There is no time limit." /><div className="daily-streak"><Star /><div><strong>A little each day</strong><p>You enjoyed 3 activities this week.</p></div></div><div className="game-list">{games.map((g)=><button className="game-card" key={g.name} onClick={() => onGame(g.name)}><span className="game-emoji">{g.icon}</span><span><strong>{g.name}</strong><small>{g.desc}</small><em><CloudOff /> {g.level} · Works offline</em></span><ChevronRight /></button>)}</div></>; }

function TodayView({ name, navigate, onGame }: { name:string; navigate:(v:ElderView)=>void; onGame:(gameName:string)=>void }) { return <><PageHeader title={`Namaste, ${name}`} subtitle="Tuesday, 15 September 2026" action={<button className="avatar-button" onClick={()=>navigate("settings")} aria-label="Open settings">{name[0]?.toUpperCase()}</button>} /><section className="feature-activity"><div><span className="section-label"><Sun /> Today’s activity</span><h2>Find the matching pictures</h2><p>A calm 5-minute activity to enjoy at your own pace.</p><ActionButton variant="warm" onClick={() => onGame("Picture Pairs")}><Play /> Start activity</ActionButton></div><span className="feature-illustration"><Flower2 /></span></section><section><div className="section-heading"><h2>Also for today</h2><button onClick={()=>navigate("games")}>See all</button></div><div className="mini-grid"><button className="mini-card" onClick={()=>navigate("games")}><span><Shapes /></span><strong>Shape Match</strong><small>About 4 minutes</small></button><button className="mini-card" onClick={()=>navigate("games")}><span><MapPin /></span><strong>Remember Place</strong><small>About 5 minutes</small></button></div></section><div className="info-row"><button onClick={()=>navigate("reminders")}><IconBadge tone="gold"><Bell /></IconBadge><span><strong>2 reminders today</strong><small>Next at 6:00 PM</small></span><ChevronRight /></button><button onClick={()=>navigate("memories")}><IconBadge tone="green"><ImageIcon /></IconBadge><span><strong>A familiar memory</strong><small>Springtime in Shillong</small></span><ChevronRight /></button></div><section><div className="section-heading"><h2>Your routine</h2><button onClick={()=>navigate("routine")}>View plan</button></div><div className="routine-preview" onClick={()=>navigate("routine")} style={{cursor:"pointer"}}><span className="done"><Check /></span><div><strong>Morning walk</strong><small>Completed at 8:30 AM</small></div><span className="next">Next</span></div></section></>; }

function MemoriesView() { const [playing, setPlaying] = useState(false); return <><PageHeader title="Memories" subtitle="Familiar moments shared with care." /><article className="memory-card"><div className="memory-photo" role="img" aria-label="Green hills and a traditional home in North East India"><img src={northeastWelcome} loading="lazy" width={1200} height={900} alt="Green hills and a traditional home in North East India"/><span><Check /> Shared with you</span></div><div><p>12 September 2026</p><h2>Springtime in the hills</h2><p>We visited this peaceful valley together after the rain. You loved the red flowers by the path.</p><button onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Volume2 />} {playing ? "Pause" : "Listen to this story"}</button></div></article><div className="empty-soft"><ImageIcon /><h2>More memories are on their way</h2><p>Your family can share familiar photos and stories with you.</p></div></>; }

function RemindersView() { const [done,setDone]=useState<number[]>([]); const [snoozed, setSnoozed]=useState<number[]>([]); const snooze = (i:number) => { setSnoozed([...snoozed, i]); setTimeout(() => setSnoozed(snoozed.filter(x => x !== i)), 900000); };
  const playReminderSound = () => {
    // Play a gentle sound for elderly users
    const audio = new Audio('/sounds/gentle-chime.mp3');
    audio.volume = 0.5; // Moderate volume
    audio.play().catch(e => console.log("Audio play failed:", e));
  };
  return <><PageHeader title="Reminders" subtitle="Your simple plan for today." /><div className="success-banner"><Check /> Reminders are ready on this device.</div>{[{time:"9:00 AM",title:"Morning medicine",desc:"After breakfast"},{time:"6:00 PM",title:"Call Priya",desc:"A friendly evening call"}].map((r,i)=><article className={cn("reminder-card",done.includes(i)&&"completed")} key={r.title}><div className="reminder-time"><Clock3 />{snoozed.includes(i)?"Snoozed":r.time}</div><h2>{r.title}</h2><p>{r.desc}</p><div><ActionButton onClick={()=>{setDone([...done,i]);playReminderSound();}}><Check /> {done.includes(i)?"Done":"Mark done"}</ActionButton><ActionButton variant="secondary" onClick={()=>snooze(i)} disabled={snoozed.includes(i)}><Clock3 /> {snoozed.includes(i)?"Snoozed":"Snooze 15 min"}</ActionButton></div></article>)}</>; }

function ActivitiesView() { const [activeTab, setActiveTab] = useState<"planned" | "finished">("planned"); const activities = [{t:"8:30 AM",n:"Morning walk",i:<Footprints/>,s:"Completed",tab:"finished"},{t:"11:00 AM",n:"Picture Pairs",i:<Flower2/>,s:"Ready",tab:"planned"},{t:"4:30 PM",n:"Listen to music",i:<Music/>,s:"Later today",tab:"planned"}]; const filtered = activities.filter(a => a.tab === activeTab);
  const handleActivityAction = (activity: typeof activities[0]) => {
    console.log(`Activity action: ${activity.n}, status: ${activity.s}`);
    // Here you would implement the actual activity start/plan logic
  };
  return <><PageHeader title="Activities" subtitle="Plan your day, one simple step at a time." action={<button className="icon-button"><Plus /></button>} /><div className="tabs-line"><button className={activeTab === "planned" ? "active" : ""} onClick={() => setActiveTab("planned")}>Planned · {activities.filter(a => a.tab === "planned").length}</button><button className={activeTab === "finished" ? "active" : ""} onClick={() => setActiveTab("finished")}>Finished · {activities.filter(a => a.tab === "finished").length}</button></div>{filtered.map(a=><article className="activity-card" key={a.n}><span>{a.i}</span><div><small>{a.t} · {a.s}</small><h2>{a.n}</h2></div><ActionButton variant="secondary" onClick={() => handleActivityAction(a)}>{a.s==="Completed"?"Plan again":"Start"}</ActionButton></article>)}</>; }

function RoutineView() { const [completed, setCompleted] = useState([0]); const routine=[["Start the day","Morning walk and breakfast",<Sun/>],["Play a game","Picture Pairs is ready",<Flower2/>],["Enjoy a memory","Springtime in the hills",<ImageIcon/>],["Evening reminder","Call Priya at 6:00 PM",<Bell/>]] as const; return <><PageHeader title="My daily routine" subtitle="A comfortable rhythm for your day." /><div className="timeline">{routine.map((x,i)=><div key={x[0]} onClick={() => !completed.includes(i) && setCompleted([...completed, i])} style={{cursor: completed.includes(i) ? "default" : "pointer"}}><span className={completed.includes(i)?"complete":""}>{completed.includes(i)?<Check />:i+1}</span><article><b>{x[2]}</b><div><h2>{x[0]}</h2><p>{x[1]}</p></div><ChevronRight /></article></div>)}</div></>; }

function HelpView({navigate}:{navigate:(v:ElderView)=>void}) { const [showGuide, setShowGuide] = useState(false);
  const handleCallTrusted = () => {
    console.log("Call trusted person feature");
    // Here you would implement actual phone call functionality
  };
  return <><PageHeader title="Help" subtitle="Support is always close by." /><ActionButton className="call-button" onClick={handleCallTrusted}><Phone /> Call a trusted person</ActionButton>{showGuide && <div className="info-banner"><Volume2 /><div><strong>Guide playing...</strong><p>Welcome to SILIRUAL! Here's how to get started...</p></div><button onClick={() => setShowGuide(false)}><X /></button></div>}<div className="help-list"><button onClick={() => setShowGuide(!showGuide)}><IconBadge><Volume2 /></IconBadge><span><strong>How to use SILIRUAL</strong><small>Hear a simple step-by-step guide</small></span><ChevronRight /></button><button onClick={()=>navigate("care")}><IconBadge tone="green"><HeartHandshake /></IconBadge><span><strong>My care circle</strong><small>People connected with you</small></span><ChevronRight /></button><button onClick={()=>navigate("location")}><IconBadge tone="gold"><LocateFixed /></IconBadge><span><strong>Location sharing</strong><small>Share only when you choose</small></span><ChevronRight /></button><button onClick={()=>navigate("settings")}><IconBadge><Settings /></IconBadge><span><strong>Settings</strong><small>Language, text size and comfort</small></span><ChevronRight /></button></div><div className="official-note"><ShieldCheck /><div><strong>SILIRUAL is a daily wellbeing companion</strong><p>It does not provide medical advice or diagnosis.</p></div></div></>; }

function SettingsView({textSize,setTextSize,onLogout}:{textSize:TextSize;setTextSize:(s:TextSize)=>void;onLogout:()=>void}) { const [sound,setSound]=useState(true); const [voice,setVoice]=useState(false); const [contrast,setContrast]=useState(false); return <><PageHeader title="Settings" subtitle="Make SILIRUAL comfortable for you." /><section className="settings-section"><h2>Text size</h2><div className="size-picker">{(["normal","large","extra"] as TextSize[]).map(s=><button key={s} className={textSize===s?"selected":""} onClick={()=>setTextSize(s)}><span className={`sample-${s}`}>Aa</span><small>{{normal:"Normal",large:"Large",extra:"Extra Large"}[s]}</small></button>)}</div></section><section className="settings-section"><ToggleRow icon={<Volume2/>} title="Sound" text="Hear helpful sounds" value={sound} onChange={()=>setSound(!sound)}/><ToggleRow icon={<Mic/>} title="Voice instructions" text="Hear instructions read aloud" value={voice} onChange={()=>setVoice(!voice)}/><ToggleRow icon={<Accessibility/>} title="High contrast" text="Make colours easier to see" value={contrast} onChange={()=>setContrast(!contrast)}/></section><ActionButton variant="danger" onClick={onLogout}>Log out</ActionButton></>; }

function CareView() { const [showConnect, setShowConnect] = useState(false); return <><PageHeader title="My care circle" subtitle="People you trust and have approved." /><article className="person-card"><div className="person-avatar">P</div><div><h2>Priya Das</h2><p>Daughter · Family</p><span><Check/> Connected</span></div><ChevronRight/></article>{showConnect && <div className="info-banner"><div><strong>Connect a trusted person</strong><p>Share your connection code with someone you trust.</p></div><button onClick={() => setShowConnect(false)}><X /></button></div>}<ActionButton variant="secondary" onClick={() => setShowConnect(!showConnect)}><Plus/> Connect a trusted person</ActionButton><div className="reassurance"><ShieldCheck/><div><strong>You decide who can connect</strong><p>You can remove access at any time.</p></div></div></>; }
function LocationView() { const [sharing,setSharing]=useState(false); return <><PageHeader title="Location sharing" subtitle="Share only when you choose."/><div className="location-visual"><MapPin/><span>1 hour</span></div><h2 className="center-title">{sharing?"Your location is being shared":"Your location is private"}</h2><p className="center-copy">{sharing?"Priya can see your location until 7:20 PM.":"No one can see where you are right now."}</p><ActionButton variant={sharing?"danger":"primary"} onClick={()=>setSharing(!sharing)}>{sharing?<><Square/> Stop sharing now</>:<><LocateFixed/> Share for one hour</>}</ActionButton><div className="reassurance"><ShieldCheck/><div><strong>Time-limited and secure</strong><p>Sharing stops automatically after one hour.</p></div></div></>; }

const elderNav: Array<{id:ElderView;label:string;icon:ReactNode}> = [{id:"today",label:"Today",icon:<Home/>},{id:"games",label:"Games",icon:<Gamepad2/>},{id:"memories",label:"Memories",icon:<Camera/>},{id:"help",label:"Help",icon:<CircleHelp/>}];
function ElderApp({name,textSize,setTextSize,onLogout}:{name:string;textSize:TextSize;setTextSize:(s:TextSize)=>void;onLogout:()=>void}) { const [view,setView]=useState<ElderView>("today"); const [game,setGame]=useState(false); if(game) return <div className="phone-app"><StatusStrip/><PicturePairs onClose={()=>{setGame(false);setView("games")}}/></div>; let content:ReactNode; if(view==="today")content=<TodayView name={name} navigate={setView} onGame={()=>setGame(true)}/>; else if(view==="games")content=<GamesView onGame={()=>setGame(true)}/>; else if(view==="memories")content=<MemoriesView/>; else if(view==="help")content=<HelpView navigate={setView}/>; else if(view==="activities")content=<ActivitiesView/>; else if(view==="reminders")content=<RemindersView/>; else if(view==="routine")content=<RoutineView/>; else if(view==="care")content=<CareView/>; else if(view==="location")content=<LocationView/>; else content=<SettingsView textSize={textSize} setTextSize={setTextSize} onLogout={onLogout}/>; const hidden=!elderNav.some(n=>n.id===view); return <div className="phone-app"><StatusStrip/>{hidden&&<button className="back-floating" onClick={()=>setView("help")}><ArrowLeft/> Back</button>}<div className="app-content">{content}</div><nav className="bottom-nav" aria-label="Main navigation">{elderNav.map(n=><button key={n.id} className={view===n.id?"active":""} onClick={()=>setView(n.id)}>{n.icon}<span>{n.label}</span></button>)}</nav></div>; }

function HelperApp({role,onLogout}:{role:"family"|"caregiver";onLogout:()=>void}) { const [view,setView]=useState("home"); const caregiver=role==="caregiver"; const items=caregiver?[{id:"elders",t:"My elders",d:"2 people connected",i:<Users/>,tone:"primary" as const},{id:"alerts",t:"Alerts",d:"1 item to review",i:<Bell/>,tone:"red" as const},{id:"notes",t:"Care notes",d:"Factual daily notes",i:<BookOpen/>,tone:"green" as const},{id:"review",t:"Review memories",d:"2 waiting",i:<Camera/>,tone:"gold" as const}]:[{id:"progress",t:"Activity progress",d:"A simple weekly summary",i:<Activity/>,tone:"primary" as const},{id:"memories",t:"Memories",d:"Share a familiar moment",i:<Camera/>,tone:"green" as const},{id:"reminders",t:"Reminders",d:"Help plan the day",i:<Bell/>,tone:"gold" as const},{id:"location",t:"Shared location",d:"Visible only with permission",i:<MapPin/>,tone:"red" as const}];
  return <div className="phone-app helper-app"><StatusStrip/><div className="app-content">{view==="home"?<><PageHeader title={caregiver?"Caregiver dashboard":"Family dashboard"} subtitle="Tuesday, 15 September 2026" action={<button className="icon-button"><Menu/></button>}/><section className="elder-summary"><div className="person-avatar">A</div><div><small>Currently supporting</small><h2>Anima Das</h2><span><Check/> Connected securely</span></div><ChevronRight/></section>{caregiver&&<div className="attention-banner"><Bell/><div><strong>One item needs attention</strong><p>A reminder was snoozed twice this morning.</p></div></div>}<h2 className="dashboard-title">What would you like to do?</h2><div className="dashboard-grid">{items.map(item=><button key={item.id} onClick={()=>setView(item.id)}><IconBadge tone={item.tone}>{item.i}</IconBadge><strong>{item.t}</strong><small>{item.d}</small><ChevronRight/></button>)}</div><div className="official-note"><ShieldCheck/><div><strong>Private and permission-based</strong><p>Anima controls what you can see and manage.</p></div></div></>:<><PageHeader title={items.find(i=>i.id===view)?.t||"Care support"} subtitle={caregiver?"For Anima Das":"Supporting Anima Das"} onBack={()=>setView("home")}/>{view==="progress"?<><div className="weekly-summary"><h2>This week</h2><div><span><strong>4</strong>Activities completed</span><span><strong>11</strong>Game rounds enjoyed</span></div></div><p className="neutral-note">These are activity summaries, not medical or cognitive scores.</p></>:view==="memories"||view==="review"?<><article className="review-memory"><img src={northeastWelcome} loading="lazy" width={1200} height={900} alt="A green valley in North East India"/><span>Awaiting review</span><h2>A day in the hills</h2><p>“A peaceful family visit after the monsoon.”</p><div><ActionButton><Check/> Approve</ActionButton><ActionButton variant="secondary"><X/> Not now</ActionButton></div></article><ActionButton variant="secondary"><Plus/> Add a new memory</ActionButton></>:view==="alerts"?<div className="alert-list"><article><IconBadge tone="red"><Bell/></IconBadge><div><h2>Morning medicine</h2><p>Snoozed twice · 10:05 AM</p><small>Check in when convenient. This is not an emergency alert.</small></div></article></div>:view==="notes"?<><div className="form-stack"><label>New factual care note<textarea placeholder="For example: Ate breakfast and joined the morning walk."/></label><ActionButton><Plus/> Save note</ActionButton></div><p className="neutral-note">Use factual observations. Avoid diagnoses or judgments.</p></>:<div className="empty-soft"><Sparkles/><h2>This area is ready</h2><p>Detailed information will appear here when connected.</p></div>}</>}</div><nav className="bottom-nav helper-nav"><button className={view==="home"?"active":""} onClick={()=>setView("home")}><Home/><span>Home</span></button><button onClick={()=>setView(caregiver?"elders":"memories")}><Users/><span>{caregiver?"Elders":"Memories"}</span></button><button onClick={()=>setView("settings")}><Settings/><span>Settings</span></button><button onClick={onLogout}><ArrowLeft/><span>Log out</span></button></nav></div>;
}

export default function SilirualApp() {
  const [stage,setStage]=useState<Stage>("welcome"); const [mode,setMode]=useState<"using"|"helping">("using"); const [role,setRole]=useState<Role>("elder"); const [name,setName]=useState("Anima"); const [textSize,setTextSize]=useState<TextSize>("large"); const [ready,setReady]=useState(false);
  
  useEffect(()=>{ 
    const saved=localStorage.getItem("silirual-demo"); 
    if(saved){
      try{
        const x=JSON.parse(saved);
        if(x.textSize)setTextSize(x.textSize);
        if(x.name)setName(x.name);
      }catch{}
    }
    
    // Check for existing auth session
    supabaseAuth.getSession().then(user => {
      if (user) {
        setName(user.displayName || "Friend");
        setRole(user.activeRole);
        setStage("app");
      }
      setReady(true);
    });
  },[]);
  
  useEffect(()=>{if(ready)localStorage.setItem("silirual-demo",JSON.stringify({textSize,name}));},[ready,textSize,name]);
  
  const sizeClass=useMemo(()=>`text-size-${textSize}`,[textSize]); 
  if(!ready)return null;
  
  const logout=async()=>{ 
    await supabaseAuth.logout();
    setStage("welcome");
  };
  
  return <div className={cn("silirual-root",sizeClass)}>{stage==="welcome"&&<Welcome onNext={(m)=>{setMode(m);setStage("role")}}/>}{stage==="role"&&<RoleSelect mode={mode} onBack={()=>setStage("welcome")} onChoose={(r)=>{setRole(r);setStage("auth")}}/>}{stage==="auth"&&<Auth role={role} onBack={()=>setStage("role")} onContinue={()=>setStage(role==="elder"?"onboarding":"app")}/>} {stage==="onboarding"&&<Onboarding textSize={textSize} setTextSize={setTextSize} onDone={(n)=>{setName(n);setStage("app")}}/>}{stage==="app"&&(role==="elder"?<ElderApp name={name} textSize={textSize} setTextSize={setTextSize} onLogout={logout}/>:<HelperApp role={role} onLogout={logout}/>)}</div>;
}
