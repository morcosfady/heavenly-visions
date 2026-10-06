/* Heavenly Visions: Arabic dictionary and translator (loaded only when the language is Arabic).
   Every English string the app draws is looked up here, exact match first, then a few patterns for numbers and names.
   Lesson titles, quiz questions and long stories stay English unless a title_ar / translation is added below.
   Missing strings are collected: open the console and run hvMissing() to see what still needs a translation. */
(function(){
const D={
/* ---- home and navigation ---- */
"Heavenly Visions":"رؤى سماوية","Sunday School for every grade":"مدارس الأحد لكل الصفوف","Sunday School":"مدارس الأحد","Lesson videos by grade":"فيديوهات الدروس لكل صف",
"Attendance":"الحضور","I'm here today!":"أنا حاضر اليوم!","Games":"الألعاب","Play & learn":"العب وتعلّم","Quizzes":"الاختبارات","Test what you know":"اختبر معلوماتك",
"The Bible":"الكتاب المقدس","Read God's Word":"اقرأ كلمة الله","Servants Workshop":"ورشة الخدام","Today":"اليوم","More to explore":"المزيد لتستكشفه",
"Kids Corner":"ركن الأطفال","Stars, avatar, shop":"نجوم وشخصية ومتجر","Bedtime":"وقت النوم","Songs and stories":"ترانيم وقصص","Prayers":"الصلوات","Talk to God":"تكلّم مع الله",
"Coloring":"التلوين","Color and keep":"لوّن واحتفظ","Calendar":"التقويم","Feasts and events":"الأعياد والفعاليات","Class Arena":"ساحة الفصول","Class vs class":"فصل ضد فصل",
"← Back":"رجوع →","◀ Back":"رجوع ▶","⬅️ Back":"رجوع ➡️","Back":"رجوع","Close":"إغلاق","✕ Close":"إغلاق ✕","Cancel":"إلغاء","OK":"حسناً","Login":"دخول","Log out":"خروج",
"Login or create profile":"ادخل أو أنشئ ملفاً","Login to continue":"سجّل الدخول للمتابعة","Create profile":"إنشاء ملف","Create my profile":"أنشئ ملفي","Language":"اللغة",
"Verse of the day":"آية اليوم","Next event":"الفعالية القادمة","No events yet":"لا توجد فعاليات بعد","Trips, retreats and feasts will show here.":"الرحلات والخلوات والأعياد ستظهر هنا.",
"Tap to learn it":"اضغط لتحفظها","Done today! Open your verse jar":"تمّت اليوم! افتح مرطبان آياتك","Feasts, fasts and saints":"أعياد وأصوام وقديسون","Prayer time":"وقت الصلاة","Tap to pray":"اضغط لتصلّي",
"Good morning! Say your morning prayer":"صباح الخير! قل صلاة الصباح","Time for your night prayer":"حان وقت صلاة النوم","Welcome to Heavenly Visions!":"أهلاً بك في رؤى سماوية!","Who are you?":"من أنت؟",
"I am a student":"أنا طالب","Create a profile to earn stars and check in":"أنشئ ملفاً لتجمع النجوم وتسجّل حضورك","I am a servant or coordinator":"أنا خادم أو منسّق","Login to open the Servants Workshop":"سجّل الدخول لتفتح ورشة الخدام",
"Just looking around":"أتفرّج فقط","You can login any time from the top":"يمكنك الدخول في أي وقت من الأعلى","Welcome":"أهلاً",
/* ---- media and lessons ---- */
"Media":"الوسائط","Search lessons (e.g. St. Mary, Pentecost)":"ابحث في الدروس (مثل: القديسة مريم، العنصرة)","Choose your class":"اختر صفك","Newest lessons":"أحدث الدروس","Songs":"ترانيم",
"Feasts & Seasons":"الأعياد والمواسم","Saints":"القديسون","lessons":"دروساً","lesson":"درساً","videos":"فيديو","video":"فيديو","Coming soon":"قريباً","Watch the video":"شاهد الفيديو","Watch the lesson":"شاهد الدرس",
"Watch on YouTube":"شاهد على يوتيوب","Video coming soon":"الفيديو قريباً","Videos for this lesson are on the way.":"فيديوهات هذا الدرس في الطريق.","All lessons playlist on YouTube":"قائمة كل الدروس على يوتيوب",
"Bible verse":"آية الحفظ","Quiz":"اختبار","Mark as done":"تمّ الدرس","Curriculum material":"مادة المنهج","Curriculum material is for servants only 🔒":"مادة المنهج للخدام فقط 🔒",
"Read it in the Bible":"اقرأها في الكتاب المقدس","Listen":"استمع","Take the quiz":"ابدأ الاختبار","Verse puzzle":"لغز الآية","Lesson done!":"تمّ الدرس!","Bible verse coming soon":"آية الحفظ قريباً",
"Quiz coming soon":"الاختبار قريباً","Game coming soon":"اللعبة قريباً","Listen coming soon":"الاستماع قريباً","Copy link":"انسخ الرابط","Link copied ✅":"تم نسخ الرابط ✅",
/* ---- attendance ---- */
"Attendance Sheet":"سجل الحضور","Enter today's code":"اكتب رمز اليوم","Your coordinator will tell you the 3-digit code.":"سيعطيك المنسّق الرمز المكوّن من 3 أرقام.","Check me in":"سجّلني","Checking…":"جارٍ التحقق…",
"You're already checked in today ✅":"سجّلتَ حضورك اليوم ✅","You're checked in!":"تم تسجيل حضورك!","See you next Sunday":"نراك الأحد القادم","Tap, then enter today's code":"اضغط ثم اكتب رمز اليوم",
"My Sundays":"أحدادي","Your check-ins will show here.":"ستظهر هنا مرات حضورك.","Create a profile to check in":"أنشئ ملفاً لتسجّل حضورك","Login first":"سجّل الدخول أولاً",
"Your profile keeps your Sundays safe, so you can see how many you came to.":"ملفك يحفظ أحدادك لتعرف كم مرة حضرت.","Set attendance code for today's Sunday School":"ضع رمز الحضور لمدرسة الأحد اليوم",
"Today's attendance code":"رمز حضور اليوم","Today's code (":"رمز اليوم (","Set the code":"ضع الرمز","Change the code":"غيّر الرمز","Save code":"احفظ الرمز","Code saved ✅":"تم حفظ الرمز ✅",
"No code set for today yet.":"لم يُحدَّد رمز لليوم بعد.","checked in today":"سجّلوا حضورهم اليوم","The code must be exactly 3 digits.":"يجب أن يكون الرمز 3 أرقام بالضبط.",
"Today's code isn't set yet. Ask your coordinator.":"لم يُحدَّد رمز اليوم بعد. اسأل المنسّق.","That code isn't right. Check with your coordinator and try again.":"هذا الرمز غير صحيح. اسأل المنسّق وحاول مرة أخرى.",
"Something went wrong. Try again.":"حدث خطأ. حاول مرة أخرى.","No internet connection. Try again.":"لا يوجد اتصال بالإنترنت. حاول مرة أخرى.","No internet connection.":"لا يوجد اتصال بالإنترنت.","No internet connection":"لا يوجد اتصال بالإنترنت",
"Your class":"صفك","Servant PIN":"الرقم السري للخادم","Show code & attendance":"اعرض الرمز والحضور","Wrong PIN.":"الرقم السري خاطئ.","Attendance for":"الحضور ليوم","checked in":"حاضر","Refresh":"تحديث",
"Share a lesson":"شارك درساً","Install the app":"ثبّت التطبيق","Tools for class":"أدوات للفصل","Servants":"الخدام","Game Builder":"صانع الألعاب","Make Kahoot, Jeopardy, Word Search and more":"اصنع كاهوت وجيوباردي وبحث الكلمات وأكثر",
/* ---- attendance sheet ---- */
"All time":"كل الوقت","This school year":"هذا العام الدراسي","Last 3 months":"آخر 3 شهور","This month":"هذا الشهر","Kids attendance":"حضور الأطفال","Servants attendance":"حضور الخدام","Kids":"الأطفال",
"Total kids":"عدد الأطفال","Total servants":"عدد الخدام","Weekly attendance":"الحضور الأسبوعي","Classes":"الفصول","Tap a class to see its kids.":"اضغط على فصل لترى أطفاله.","Needs a follow up":"يحتاج متابعة",
"Servants":"الخدام","All kids":"كل الأطفال","All classes":"كل الفصول","All levels":"كل المستويات","80%+":"80% فأكثر","50 to 79%":"50 إلى 79%","Under 50%":"أقل من 50%","Search a name":"ابحث عن اسم",
"Class average":"متوسط الفصل","Here":"حاضر","My attendance":"حضوري","My class":"فصلي","Ranking":"الترتيب","ranking":"الترتيب","Nobody matches. Try another filter.":"لا أحد مطابق. جرّب فلتراً آخر.",
"Hasn't come for 3 Sundays":"لم يحضر منذ 3 آحاد","Under 50% so far":"أقل من 50% حتى الآن","Present":"حاضر","Missed":"غائب","Sessions":"الجلسات","Current streak":"السلسلة الحالية","Best streak":"أفضل سلسلة",
"Sundays in a row":"آحاد متتالية","First check in":"أول حضور","Last check in":"آخر حضور","History":"السجل","Calendar":"التقويم","By month":"حسب الشهر","Streak":"السلسلة","Badges":"الأوسمة","Sunday calendar":"تقويم الآحاد",
"Here":"حاضر","Not here":"غائب","No Sunday School":"لا مدرسة أحد","Dashed: coming up":"المتقطع: قادم","Tap a day to see the time.":"اضغط على يوم لترى الوقت.","Sundays attended":"آحاد حضرتها",
"Sundays missed":"آحاد غبتها","Sundays since joining":"آحاد منذ انضمامك","Your Sundays":"أحدادك","No check-ins yet. See you Sunday! 🙏":"لا يوجد حضور بعد. نراك الأحد! 🙏","See you Sunday! 🙏":"نراك الأحد! 🙏",
"Not enough data yet":"لا توجد بيانات كافية بعد","Great":"ممتاز","Growing":"في نمو","Keep going":"استمر","Needs a visit":"يحتاج زيارة","Thank you for serving faithfully.":"شكراً لخدمتك الأمينة.",
"No Sunday School days":"أيام بلا مدرسة أحد","Mark holidays so nobody is counted absent.":"حدّد العطلات حتى لا يُحسب أحد غائباً.","Mark as no Sunday School":"حدّد أنها بلا مدرسة أحد","Undo":"تراجع","Export":"تصدير",
"Download everyone (CSV)":"حمّل الجميع (CSV)","Download one class (CSV)":"حمّل فصلاً واحداً (CSV)","Show the numbers":"اعرض الأرقام","Try again":"حاول مرة أخرى","Could not load":"تعذّر التحميل",
"Check your internet and try again.":"تحقق من الإنترنت وحاول مرة أخرى.","Servants only":"للخدام فقط","Your classes":"فصولك","You and your class":"أنت وفصلك","Choose a class to start.":"اختر فصلاً لتبدأ.",
/* ---- profile, login, stars ---- */
"My Profile":"ملفي","Profile":"الملف الشخصي","STARS TO SPEND":"نجوم للإنفاق","Pick your picture":"اختر صورتك","How to get points":"كيف تحصل على النقاط","Recent points":"آخر النقاط",
"No points yet. Check in at class to start!":"لا نقاط بعد. سجّل حضورك في الفصل لتبدأ!","Check in at class +10":"سجّل حضورك في الفصل ‎+10","Check in at class +5":"سجّل حضورك في الفصل ‎+5",
"Finish a game +10":"أنهِ لعبة ‎+10","Win a live class game +50":"اربح لعبة مباشرة في الفصل ‎+50","Publish a game +20":"انشر لعبة ‎+20","Manage access":"إدارة الصلاحيات","Manage Access":"إدارة الصلاحيات",
"Username or email":"اسم المستخدم أو البريد","Password":"كلمة المرور","First name":"الاسم الأول","Last name":"اسم العائلة","Email":"البريد الإلكتروني","Phone":"الهاتف","Username":"اسم المستخدم","Church":"الكنيسة","Grade":"الصف",
"Wrong username or password.":"اسم المستخدم أو كلمة المرور خاطئة.","Please login again":"سجّل الدخول من جديد","Waiting for approval":"في انتظار الموافقة","Please pick your church from the list.":"اختر كنيستك من القائمة.",
"Student":"طالب","Servant":"خادم","Coordinator":"منسّق","Priest":"كاهن","Master":"المسؤول",
/* ---- kids corner ---- */
"Your stars and avatar":"نجومك وشخصيتك","Avatar":"الشخصية","Shop":"المتجر","Earn":"اكسب","to spend":"للإنفاق","earned in total":"مجموع ما كسبت","more stars to":"نجوم إضافية لتصل إلى","Top level! Wonderful!":"أعلى مستوى! رائع!",
"Skin":"البشرة","Hair":"الشعر","Hair color":"لون الشعر","Eyes":"العيون","Outfit":"الملابس","Extra":"إضافات","Short":"قصير","Long":"طويل","Curly":"مجعّد","Buzz":"حليق","Pigtails":"ضفيرتان","Side part":"فرق جانبي",
"Dots":"نقطتان","Happy":"مبتسم","Sparkle":"لامع","Lashes":"رموش","None":"بدون","Glasses":"نظارة","Freckles":"نمش","Surprise me":"فاجئني","Save my avatar":"احفظ شخصيتي","Saved! Looking great ✨":"تم الحفظ! تبدو رائعاً ✨",
"Buy hats, wings, pets and more in the Shop, then wear them here.":"اشترِ قبعات وأجنحة وحيوانات أليفة وأكثر من المتجر ثم ارتدِها هنا.","Hats":"قبعات","Halos":"هالات","Wings":"أجنحة","Robes":"أردية","Pets":"حيوانات أليفة",
"Backgrounds":"خلفيات","Frames":"إطارات","Common":"شائع","Rare":"نادر","Legendary":"أسطوري","Yours":"ملكك","Yours now! Don't forget to save 💾":"أصبح ملكك! لا تنسَ الحفظ 💾","Buy it!":"اشترِه!","Not enough stars yet.":"النجوم لا تكفي بعد.",
"You already own it.":"أنت تملكه بالفعل.","Could not buy. Try again.":"تعذّر الشراء. حاول مرة أخرى.","You already have this one. Wear it in the Avatar tab.":"لديك هذا بالفعل. ارتدِه من تبويب الشخصية.","earned":"مكتسب","Earned!":"مكتسب!",
"First star":"أول نجمة","100 stars":"100 نجمة","500 stars":"500 نجمة","First Sunday":"أول أحد","10 Sundays":"10 آحاد","4 in a row":"4 متتالية","8 in a row":"8 متتالية","First purchase":"أول شراء","Collector":"الجامع","Quiz whiz":"عبقري الاختبارات",
"Gamer":"اللاعب","Scholar":"الدارس","Bible reader":"قارئ الكتاب","Artist":"الفنان","Verse jar":"مرطبان الآيات","Earn your first star":"اكسب أول نجمة لك","Earn 100 stars in total":"اكسب 100 نجمة","Earn 500 stars in total":"اكسب 500 نجمة",
"Check in at class":"سجّل حضورك في الفصل","Check in 10 times":"سجّل حضورك 10 مرات","Come 4 Sundays in a row":"احضر 4 آحاد متتالية","Come 8 Sundays in a row":"احضر 8 آحاد متتالية","Come every Sunday of a month":"احضر كل آحاد الشهر","Come 10 times":"احضر 10 مرات",
"Buy something in the shop":"اشترِ شيئاً من المتجر","Own 8 shop items":"امتلك 8 أشياء من المتجر","Get 3 stars on 3 quizzes":"احصل على 3 نجوم في 3 اختبارات","Finish 10 games":"أنهِ 10 ألعاب","Mark 10 lessons done":"أنهِ 10 دروس","Read 10 Bible chapters":"اقرأ 10 أصحاحات",
"Finish 5 coloring pages":"أنهِ 5 صفحات تلوين","Learn 7 daily verses":"احفظ 7 آيات يومية","Perfect month":"شهر مثالي","Check in once":"سجّل حضورك مرة","Check in at class":"سجّل حضورك في الفصل",
"Little Lamb":"الحمل الصغير","Shepherd's Helper":"مساعد الراعي","Faithful Friend":"الصديق الأمين","Light Bearer":"حامل النور","Temple Builder":"بانٍ للهيكل","Saint in Training":"قديس تحت التدريب","LEVEL UP!":"ترقية!","Wonderful!":"رائع!",
"Quiz: each right answer":"الاختبار: كل إجابة صحيحة","Quiz: all 3 stars":"الاختبار: النجوم الثلاث","Finish a game":"أنهِ لعبة","Daily verse challenge":"تحدي الآية اليومية","Read a Bible chapter":"اقرأ أصحاحاً","Finish a coloring page":"أنهِ صفحة تلوين",
"Mark a lesson done":"أنهِ درساً","4 Sundays in a row":"4 آحاد متتالية","Some things can only be done a few times a day, so come back tomorrow for more!":"بعض الأشياء تُحسب بضع مرات في اليوم، فعُد غداً لتكسب المزيد!","Level progress":"تقدّم المستوى",
"Login to earn stars":"سجّل الدخول لتجمع النجوم","Make a profile to collect stars, build your avatar and win badges.":"أنشئ ملفاً لتجمع النجوم وتصمّم شخصيتك وتربح الأوسمة.","That is enough stars for today. Come back tomorrow! 🌙":"هذا يكفي من النجوم اليوم. عُد غداً! 🌙",
"Kids Corner: avatar, shop, badges":"ركن الأطفال: شخصية ومتجر وأوسمة","New badge:":"وسام جديد:",
/* ---- daily verse, prayers, calendar ---- */
"Daily Verse":"آية اليوم","One verse a day":"آية كل يوم","Step 1 of 3. Read it":"الخطوة 1 من 3. اقرأها","Step 2 of 3. Fill the missing words":"الخطوة 2 من 3. املأ الكلمات الناقصة","Step 2 of 3. Put the words in order":"الخطوة 2 من 3. رتّب الكلمات",
"Step 3 of 3. Where is this verse?":"الخطوة 3 من 3. أين هذه الآية؟","I read it":"قرأتها","Start again":"ابدأ من جديد","Well done! You learned it!":"أحسنت! لقد حفظتها!","Today's verse is done ✅":"آية اليوم تمّت ✅","My verse jar":"مرطبان آياتي",
"Say a prayer":"قل صلاة","Listen":"استمع","day":"يوم","days":"أيام","in a row":"متتالية","days in a row":"أيام متتالية","Not that one. Try again 🙂":"ليست هذه. حاول مرة أخرى 🙂","Almost! Try another one 🙂":"قريب! جرّب أخرى 🙂",
"Our servants are still checking these prayers. More are coming soon.":"خدامنا ما زالوا يراجعون هذه الصلوات. المزيد قريباً.","Morning prayer":"صلاة الصباح","Before a meal":"قبل الأكل","After a meal":"بعد الأكل","Before study":"قبل المذاكرة",
"For my family":"من أجل أسرتي","Thank You, God":"شكراً لك يا الله","Night prayer":"صلاة النوم","The Lord's Prayer":"الصلاة الربانية","Holy God (Trisagion)":"قدوس الله (التريساجيون)","The Lord is my Shepherd":"الرب راعيّ",
"A prayer for you":"صلاة من أجلك","Read to me":"اقرأ لي","I prayed":"صليت","Prayed today ✅":"صليت اليوم ✅","Stop":"إيقاف","God bless you 🙏":"ليباركك الله 🙏","Matthew 6:9-13":"متى 6: 9-13","Church prayer":"صلاة الكنيسة","Psalm 23 (KJV, adapted)":"مزمور 23",
"Thank You, God, for a new day.":"شكراً لك يا الله على يوم جديد.","Please be with me at school and at home.":"كن معي في المدرسة وفي البيت.","Help me to be kind, honest and brave.":"ساعدني أن أكون لطيفاً وأميناً وشجاعاً.","Amen.":"آمين.",
"Thank You, Lord, for this food.":"شكراً لك يا رب على هذا الطعام.","Bless it, and bless the hands that made it.":"باركه، وباركِ اليدين التي أعدّته.","Please help children who are hungry.":"أعِن الأطفال الجائعين.",
"Thank You, Lord, for filling us.":"شكراً لك يا رب لأنك أشبعتنا.","We are grateful for everything You give us.":"نحن شاكرون على كل ما تعطينا.","Lord Jesus, open my mind to learn.":"يا رب يسوع، افتح ذهني لأتعلّم.","Help me to listen and to do my best.":"ساعدني أن أسمع وأبذل جهدي.",
"Lord, please bless my family.":"يا رب، باركْ أسرتي.","Keep us safe and help us love one another.":"احفظنا وساعدنا أن يحب بعضنا بعضاً.","Bless my friends and my teachers too.":"وباركْ أصدقائي ومعلّميّ أيضاً.",
"Thank You, God, for my family, my friends and my church.":"شكراً لك يا الله على أسرتي وأصدقائي وكنيستي.","Thank You for the sun, the rain and every good thing.":"شكراً على الشمس والمطر وكل شيء حسن.","Thank You for loving me.":"شكراً لأنك تحبني.",
"Thank You, Jesus, for today.":"شكراً لك يا يسوع على هذا اليوم.","Forgive me for the times I was not kind.":"اغفر لي المرات التي لم أكن فيها لطيفاً.","Keep me safe while I sleep, and send Your angels to watch over me.":"احفظني وأنا نائم، وأرسل ملائكتك لتحرسني.",
"Our Father who art in heaven, hallowed be Thy name.":"أبانا الذي في السماوات، ليتقدّس اسمك.","Thy kingdom come. Thy will be done on earth as it is in heaven.":"ليأتِ ملكوتك. لتكن مشيئتك كما في السماء كذلك على الأرض.","Give us this day our daily bread.":"خبزنا كفافنا أعطنا اليوم.",
"And forgive us our trespasses, as we forgive those who trespass against us.":"واغفر لنا ذنوبنا كما نغفر نحن أيضاً للمذنبين إلينا.","And lead us not into temptation, but deliver us from the evil one.":"ولا تدخلنا في تجربة، لكن نجّنا من الشرير.",
"For Thine is the kingdom and the power and the glory forever. Amen.":"لأن لك الملك والقوة والمجد إلى الأبد. آمين.","Holy God, Holy Mighty, Holy Immortal,":"قدوس الله، قدوس القوي، قدوس الحي الذي لا يموت،","Who was crucified for us,":"الذي صُلب من أجلنا،","Have mercy on us.":"ارحمنا.",
"The Lord is my shepherd; I shall not want.":"الرب راعيّ فلا يعوزني شيء.","He makes me to lie down in green pastures; He leads me beside the still waters.":"في مراعٍ خضر يربضني. إلى مياه الراحة يوردني.","He restores my soul; He leads me in the paths of righteousness for His name's sake.":"يردّ نفسي. يهديني إلى سبل البرّ من أجل اسمه.",
"Surely goodness and mercy shall follow me all the days of my life, and I will dwell in the house of the Lord forever.":"إنما خير ورحمة يتبعانني كل أيام حياتي، وأسكن في بيت الرب إلى مدى الأيام.",
"Coptic and regular dates":"التواريخ القبطية والميلادية","Coptic calendar":"التقويم القبطي","Coming up":"قادم قريباً","Saint of the day":"قديس اليوم","Next saint:":"القديس التالي:","Feast":"عيد","Fast":"صوم","Saint":"قديس","Event":"فعالية",
"Tap a day to see what it is.":"اضغط على يوم لترى ما فيه.","Previous month":"الشهر السابق","Next month":"الشهر التالي","Learn more":"اعرف المزيد","A normal day.":"يوم عادي.","Today":"اليوم","Tomorrow":"غداً",
"Feast of Nayrouz":"عيد النيروز","Feast of the Cross":"عيد الصليب","The Nativity of Jesus":"عيد الميلاد المجيد","Circumcision of Jesus":"ختان السيد المسيح","Feast of Theophany":"عيد الغطاس","Wedding at Cana":"عرس قانا الجليل","Presentation of Jesus":"دخول السيد المسيح الهيكل",
"Finding of the Cross":"عيد ظهور الصليب","The Annunciation":"عيد البشارة","Jesus Enters Egypt":"دخول المسيح أرض مصر","Feast of the Apostles":"عيد الرسل","The Transfiguration":"عيد التجلّي","St. Mary's Departure":"نياحة السيدة العذراء","Lazarus Saturday":"سبت لعازر",
"Palm Sunday":"أحد الشعانين","Good Friday":"الجمعة العظيمة","Resurrection (Easter)":"عيد القيامة المجيد","Ascension of Jesus":"عيد الصعود","Pentecost":"عيد العنصرة","Feast of Nineveh":"عيد نينوى","Great Lent":"الصوم الكبير","Fast of Nineveh":"صوم نينوى",
"Apostles' Fast":"صوم الرسل","Nativity Fast":"صوم الميلاد","Fast of St. Mary":"صوم السيدة العذراء","begins":"يبدأ",
/* ---- bedtime and coloring ---- */
"Soft songs and sleepy stories":"ترانيم هادئة وقصص للنوم","Stories":"قصص","Prayer":"صلاة","Sleep timer":"مؤقّت النوم","Off":"إيقاف","10 min":"10 دقائق","20 min":"20 دقيقة","30 min":"30 دقيقة","Sleep timer is off":"مؤقّت النوم متوقف","Next song":"الأغنية التالية",
"Sweet dreams. Goodnight 🌙":"أحلاماً سعيدة. تصبح على خير 🌙","Thank God for today before you sleep.":"اشكر الله على اليوم قبل أن تنام.","Say your night prayer":"قل صلاة النوم","Pick a picture":"اختر صورة","My gallery":"معرضي","My Gallery":"معرضي","Saved on this phone":"محفوظ على هذا الهاتف",
"Tap a color, then tap the picture":"اختر لوناً ثم اضغط على الصورة","Fill":"تعبئة","Brush":"فرشاة","Eraser":"ممحاة","Stickers":"ملصقات","Redo":"إعادة","Brush size":"حجم الفرشاة","Save to my gallery":"احفظ في معرضي","Download":"تحميل","Saved to My Gallery! 🎉":"تم الحفظ في معرضي! 🎉",
"No pictures yet":"لا صور بعد","Color a page and press Save to keep it here.":"لوّن صفحة واضغط حفظ لتبقى هنا.","Delete":"حذف","Zoom in":"تكبير","Zoom out":"تصغير","Reset zoom":"إعادة الحجم","The Cross":"الصليب","The Dove":"الحمامة","Noah's Ark":"فلك نوح","The Good Shepherd":"الراعي الصالح",
"Daniel and the Lions":"دانيال والأسود","David and Goliath":"داود وجليات","Jonah and the Whale":"يونان والحوت","The Nativity":"الميلاد","St. Mary":"القديسة مريم","St. George":"مار جرجس","Our Church":"كنيستنا","Seven Days":"الأيام السبعة","The Holy Bible":"الكتاب المقدس","The Lamb":"الحمل",
/* ---- servants tools ---- */
"Lesson Planner":"مخطط الدروس","Plan each Sunday":"خطط لكل أحد","One lesson card for each Sunday":"بطاقة درس لكل أحد","This week":"هذا الأسبوع","Month":"الشهر","Year":"السنة","Plan it":"خطّط له","Edit":"تعديل","Sunday Mode":"وضع الأحد","Not planned":"غير مخطّط","Nothing planned yet":"لا شيء مخطّط بعد",
"Plan a Sunday":"خطط لأحد","Title":"العنوان","Bible reading":"القراءة الكتابية","Memory verse":"آية الحفظ","Verse reference":"مرجع الآية","Lesson video":"فيديو الدرس","Game":"اللعبة","Quiz":"الاختبار","Activity or craft idea":"فكرة نشاط أو أشغال","Materials to bring":"الأدوات المطلوبة",
"Add an item":"أضف عنصراً","Add":"إضافة","Notes (only servants see these)":"ملاحظات (يراها الخدام فقط)","Status":"الحالة","Draft":"مسودة","Ready":"جاهز","Done":"تمّ","Ready lessons show on the kids' This Sunday card.":"الدروس الجاهزة تظهر للأطفال في بطاقة هذا الأحد.","Save":"حفظ",
"Delete this lesson":"احذف هذا الدرس","Copy this lesson":"انسخ هذا الدرس","Copy":"نسخ","To Sunday":"إلى الأحد","Copied as a draft ✅":"تم النسخ كمسودة ✅","Start from the curriculum":"ابدأ من المنهج","Choose a lesson to fill the form":"اختر درساً لملء النموذج","Saved ✅":"تم الحفظ ✅",
"Opening prayer":"صلاة الافتتاح","Closing prayer":"صلاة الختام","Time to play!":"حان وقت اللعب!","Open the game":"افتح اللعبة","Let's test what we learned!":"لنختبر ما تعلّمناه!","Open the quiz":"افتح الاختبار","Finish and mark done":"أنهِ وسجّل أنه تمّ","Exit":"خروج","Next":"التالي","Activity":"النشاط",
"Announcements":"الإعلانات","Tell your class":"أخبر فصلك","New announcement":"إعلان جديد","Message":"الرسالة","Picture":"الصورة","Kind":"النوع","Event date (optional)":"تاريخ الفعالية (اختياري)","Hide after (optional)":"أخفِه بعد (اختياري)","Pin to the top":"ثبّت في الأعلى","Send to":"أرسل إلى",
"My class (":"فصلي (","Everyone":"الجميع","Post it":"انشره","Posted":"المنشور","Posted ✅":"تم النشر ✅","Nothing posted yet.":"لا شيء منشور بعد.","News":"الأخبار","From your teachers":"من معلّميك","No news right now":"لا أخبار الآن","Check back soon!":"عُد قريباً!","Bring something":"أحضر شيئاً","Important":"مهم",
"Follow up":"المتابعة","Kids who missed":"أطفال غابوا","Kids who missed 3 Sundays or are under 50%":"أطفال غابوا 3 آحاد أو أقل من 50%","Contacted":"تم الاتصال","Visited":"تمت الزيارة","Add note":"أضف ملاحظة","Everyone is doing well":"الجميع بخير","Nobody needs a follow up right now.":"لا أحد يحتاج متابعة الآن.",
"followed up this month":"تمت متابعتهم هذا الشهر","Gentle calls and visits make a big difference":"الاتصال والزيارة اللطيفة يصنعان فرقاً كبيراً","Library":"المكتبة","Worksheets and links":"أوراق عمل وروابط","Resource Library":"مكتبة الموارد","Worksheets, crafts, songs and slides":"أوراق عمل وأشغال وترانيم وشرائح",
"Search":"بحث","All types":"كل الأنواع","All topics":"كل المواضيع","Add a link":"أضف رابطاً","Worksheet":"ورقة عمل","Craft":"أشغال","Song":"ترنيمة","Slides":"شرائح","Link":"رابط","Open the link ↗":"افتح الرابط ↗","Type":"النوع","Class":"الفصل","Topic (optional)":"الموضوع (اختياري)",
"Events and Trips":"الفعاليات والرحلات","What is coming up":"ما هو قادم","Add an event":"أضف فعالية","Open the full calendar":"افتح التقويم الكامل","Earlier":"سابقاً","Past":"انتهت","Add to my calendar":"أضف إلى تقويمي","Date":"التاريخ","Last day (optional)":"آخر يوم (اختياري)","Time (optional)":"الوقت (اختياري)","Place":"المكان","Details":"التفاصيل",
"Trip":"رحلة","Retreat":"خلوة","Convention":"مؤتمر","Service":"خدمة","Login to see events":"سجّل الدخول لترى الفعاليات","Monthly Report":"التقرير الشهري","Monthly report":"التقرير الشهري","For Abouna":"لأبونا","For Abouna and the team":"لأبونا وفريق الخدمة","Generate monthly report":"أنشئ التقرير الشهري",
"Print or save as PDF":"اطبع أو احفظ كملف PDF","Sunday School Report":"تقرير مدرسة الأحد","Learning at home":"التعلّم في البيت","Class competition":"مسابقة الفصول","Servants":"الخدام","Events":"الفعاليات","Class against class":"فصل ضد فصل","Competition is on":"المسابقة قائمة","No competition running":"لا مسابقة الآن",
"All classes":"كل الفصول","Hall of Fame":"قاعة المشاهير","Run the competition":"أدِر المسابقة","Prize (optional)":"الجائزة (اختياري)","Start this month's competition":"ابدأ مسابقة هذا الشهر","End it now and pick the winner":"أنهِها الآن واختر الفائز","Congratulations!":"مبروك!","WINNER":"الفائز",
"Login to join the Arena":"سجّل الدخول لتشارك في الساحة","Month progress":"تقدّم الشهر","Notifications":"الإشعارات","All caught up":"لا جديد","New things will show here.":"الأشياء الجديدة ستظهر هنا.","Mark all as read":"علّم الكل كمقروء","Offline":"بدون إنترنت","Available offline":"متاح بدون إنترنت","Back online ✅":"عاد الاتصال ✅",
"You are offline. Saved things still work.":"أنت بدون إنترنت. المحفوظات تعمل.","Saved. Your stars will arrive when you are online ⭐":"تم الحفظ. ستصلك نجومك عند عودة الإنترنت ⭐",
/* ---- games, quizzes, bible, builder ---- */
"Play":"العب","Bible Match":"مطابقة الكتاب","Name Scramble":"رتّب الاسم","Join a live game":"انضم إلى لعبة مباشرة","Enter a game code":"اكتب رمز اللعبة","Join a game":"انضم إلى لعبة","Game code":"رمز اللعبة","Join":"انضم","New games":"ألعاب جديدة","More games":"المزيد من الألعاب","More games coming soon!":"المزيد من الألعاب قريباً!",
"Show games for all classes":"اعرض ألعاب كل الفصول","Pick a quiz, earn stars":"اختر اختباراً واكسب نجوماً","Question":"السؤال","Correct! 🎉":"صحيح! 🎉","Not quite. The right answer is in green.":"ليس تماماً. الإجابة الصحيحة بالأخضر.","Perfect! God bless you!":"ممتاز! ليباركك الله!","Great job!":"أحسنت!","Play again":"العب مرة أخرى",
"Choose a book":"اختر سفراً","Old Testament":"العهد القديم","New Testament":"العهد الجديد","Choose a chapter":"اختر أصحاحاً","King James Version":"ترجمة سميث وفان دايك","Smaller text":"نص أصغر","Bigger text":"نص أكبر","Text size":"حجم النص","Previous":"السابق","‹ Previous":"› السابق","Next ›":"‹ التالي","Loading…":"جارٍ التحميل…",
"Couldn't load this chapter. Check your internet.":"تعذّر تحميل هذا الأصحاح. تحقق من الإنترنت.","Continue:":"تابع:","Done ✅":"تمّ ✅","Try again":"حاول مرة أخرى",
"Genesis":"التكوين","Exodus":"الخروج","Leviticus":"اللاويين","Numbers":"العدد","Deuteronomy":"التثنية","Joshua":"يشوع","Judges":"القضاة","Ruth":"راعوث","1 Samuel":"صموئيل الأول","2 Samuel":"صموئيل الثاني","1 Kings":"الملوك الأول","2 Kings":"الملوك الثاني","1 Chronicles":"أخبار الأيام الأول","2 Chronicles":"أخبار الأيام الثاني",
"Ezra":"عزرا","Nehemiah":"نحميا","Esther":"أستير","Job":"أيوب","Psalms":"المزامير","Proverbs":"الأمثال","Ecclesiastes":"الجامعة","Song of Solomon":"نشيد الأنشاد","Isaiah":"إشعياء","Jeremiah":"إرميا","Lamentations":"مراثي إرميا","Ezekiel":"حزقيال","Daniel":"دانيال","Hosea":"هوشع","Joel":"يوئيل","Amos":"عاموس","Obadiah":"عوبديا",
"Jonah":"يونان","Micah":"ميخا","Nahum":"ناحوم","Habakkuk":"حبقوق","Zephaniah":"صفنيا","Haggai":"حجي","Zechariah":"زكريا","Malachi":"ملاخي","Matthew":"متى","Mark":"مرقس","Luke":"لوقا","John":"يوحنا","Acts":"أعمال الرسل","Romans":"رومية","1 Corinthians":"كورنثوس الأولى","2 Corinthians":"كورنثوس الثانية","Galatians":"غلاطية","Ephesians":"أفسس",
"Philippians":"فيلبي","Colossians":"كولوسي","1 Thessalonians":"تسالونيكي الأولى","2 Thessalonians":"تسالونيكي الثانية","1 Timothy":"تيموثاوس الأولى","2 Timothy":"تيموثاوس الثانية","Titus":"تيطس","Philemon":"فليمون","Hebrews":"العبرانيين","James":"يعقوب","1 Peter":"بطرس الأولى","2 Peter":"بطرس الثانية","1 John":"يوحنا الأولى","2 John":"يوحنا الثانية","3 John":"يوحنا الثالثة","Jude":"يهوذا","Revelation":"رؤيا يوحنا",
/* ---- shared messages and buttons ---- */
"Loading your saved data…":"جارٍ تحميل بياناتك…","Could not save":"تعذّر الحفظ","Could not save. Try again.":"تعذّر الحفظ. حاول مرة أخرى.","Deleted":"تم الحذف","Not allowed":"غير مسموح","Not allowed.":"غير مسموح.","Added ✅":"تمت الإضافة ✅","Copied ✅":"تم النسخ ✅","This is for approved servants.":"هذا للخدام المعتمدين فقط.",
"This is for coordinators and priests.":"هذا للمنسّقين والكهنة فقط.","Set your class in your profile first.":"حدّد فصلك في ملفك أولاً.","Check me in":"سجّلني","Yes!":"نعم!","Select":"اختر","Choose…":"اختر…","Untitled":"بدون عنوان","Back to Games":"الرجوع إلى الألعاب","Back to lesson":"الرجوع إلى الدرس","Preview":"معاينة","Publish":"نشر","Unpublish":"إلغاء النشر",
"Play together in class on the TV or projector.":"العبوا معاً في الفصل على الشاشة.","Kids play on their own phone, in class or at home.":"يلعب الأطفال على هواتفهم في الفصل أو في البيت.","Live game":"لعبة مباشرة","Kids play alone":"يلعب الأطفال منفردين","Game over":"انتهت اللعبة","Waiting for approval ⏳":"في انتظار الموافقة ⏳",
"Design system":"نظام التصميم","Components used everywhere":"مكونات تُستخدم في كل مكان","Select a class":"اختر فصلاً",
/* ---- weekday and misc short labels ---- */
"Week":"الأسبوع","Day":"اليوم","Present":"حاضر","Weekly attendance trend":"اتجاه الحضور الأسبوعي","Kids who came":"الأطفال الذين حضروا","Servants only":"للخدام فقط","Not enough Sundays this month to draw a line.":"لا توجد آحاد كافية هذا الشهر لرسم الخط.",
"The line appears after two Sundays. See you Sunday! 🙏":"يظهر الخط بعد أحدين. نراك الأحد! 🙏","Glory be to God forever. Amen.":"له المجد إلى الأبد. آمين."
};
Object.assign(D,{
"+10 bonus":"مكافأة ‎+10","+5 bonus":"مكافأة ‎+5","All":"الكل","Animals":"الحيوانات","Attendance by month":"الحضور حسب الشهر","Earned":"مكتسب","Find the pairs":"جد الأزواج","Fix the Bible names":"أصلح أسماء الكتاب المقدس","For servants only":"للخدام فقط","Intro":"مقدمة","Last 8":"آخر 8",
"Learn · Play · Grow in Faith":"تعلّم · العب · انمُ في الإيمان","My avatar":"شخصيتي","My profile":"ملفي","New":"جديد","Nothing here yet":"لا شيء هنا بعد","Sundays":"آحاد","This is for servants":"هذا للخدام","Top classes":"أفضل الفصول","Welcome back":"أهلاً بعودتك",
"Ask your coordinator or priest for access.":"اطلب الصلاحية من المنسّق أو الكاهن.","Dismiss":"إخفاء","Main":"الرئيسية","Bible":"الكتاب المقدس","Creation":"الخلق","Daniel & the Lions":"دانيال والأسود","Nayrouz":"النيروز","Spare Lessons":"دروس إضافية","Light":"النور",
"Baseball cap":"قبعة رياضية","Shepherd hat":"قبعة الراعي","Golden crown":"تاج ذهبي","Bishop's mitre":"تاج الأسقف","Golden halo":"هالة ذهبية","Star halo":"هالة النجوم","Angel wings":"أجنحة الملاك","Golden wings":"أجنحة ذهبية","Blue robe":"رداء أزرق","Green robe":"رداء أخضر","Royal robe":"رداء ملكي",
"Robe of light":"رداء النور","Little fish":"سمكة صغيرة","Lamb":"حمل","Dove":"حمامة","Lion cub":"شبل أسد","Clouds":"سحاب","Desert":"صحراء","Starry night":"ليلة مرصعة بالنجوم","Noah's ark":"فلك نوح","Rainbow":"قوس قزح","Gold frame":"إطار ذهبي","Rainbow frame":"إطار قوس قزح","Glowing frame":"إطار متوهج",
"Songs play through YouTube. On some phones the music stops when the screen locks. Keep the screen on, or lower the brightness.":"الترانيم تُشغَّل عبر يوتيوب. في بعض الهواتف تتوقف الموسيقى عند قفل الشاشة. أبقِ الشاشة مضاءة أو اخفض السطوع.",
"More quizzes come with new lessons.":"اختبارات أكثر مع الدروس الجديدة.","Set up the Master.":"إعداد المسؤول.","Open a sheet":"افتح نافذة","Show a toast":"أظهر رسالة","Star burst":"انفجار نجوم",
"Pizza party":"حفلة بيتزا","Choose a username":"اختر اسم مستخدم","Password (6 or more)":"كلمة المرور (6 أو أكثر)","Your church":"كنيستك","Start typing the church name…":"ابدأ بكتابة اسم الكنيسة…","Create profile":"إنشاء ملف","Creating…":"جارٍ الإنشاء…","Waiting for approval":"في انتظار الموافقة",
"Setup code":"رمز الإعداد","Role":"الدور","Move up":"انقل لأعلى","Move down":"انقل لأسفل","Remove":"إزالة","Add at least 1 question first":"أضف سؤالاً واحداً على الأقل أولاً","Answer locked in":"تم تثبيت إجابتك","Wait for the others…":"انتظر الآخرين…","Get ready…":"استعد…","You are in!":"أنت داخل!",
"Not quite, try again":"ليس تماماً، حاول مرة أخرى","Show answer":"اعرض الإجابة","Next clue":"الدليل التالي","Hint":"تلميح","Check":"تحقق","True":"صحيح","False":"خطأ","Across":"أفقي","Down":"رأسي","Reveal":"اكشف","Show a piece":"أظهر قطعة","Mystery picture":"صورة غامضة","Who am I?":"من أنا؟","Spin":"أدِر","SPIN!":"أدِر!",
"Start the game":"ابدأ اللعبة","Play anyway":"العب على أي حال","Restart":"إعادة","Download":"تحميل","Update":"تحديث","Install":"تثبيت","Skip ›":"تخطَّ ›","Welcome, ":"أهلاً، ","I'm here!":"أنا هنا!","Stars":"النجوم","Trend":"الاتجاه","Tap, then enter today's code":"اضغط ثم اكتب رمز اليوم"
});
Object.assign(D,{
"Kahoot Quiz":"اختبار كاهوت","Race to answer, live leaderboard":"سباق للإجابة مع لوحة نتائج مباشرة","Jeopardy Board":"لوحة جيوباردي","Teams pick squares, 100 to 500 points":"الفرق تختار مربعات من 100 إلى 500 نقطة","Wheel Spin":"عجلة الحظ","Spin picks a question or a kid":"العجلة تختار سؤالاً أو طفلاً",
"Who Am I?":"من أنا؟","Clues reveal a Bible character or saint":"تلميحات تكشف شخصية كتابية أو قديساً","Story Order":"ترتيب القصة","Put the story events in order":"رتّب أحداث القصة","Verse Builder":"بناء الآية","Put the missing words back in the verse":"أعد الكلمات الناقصة إلى الآية",
"Word Search":"بحث الكلمات","Find hidden lesson words in a grid":"جد كلمات الدرس المخفية في الشبكة","Matching Pairs":"الأزواج المتطابقة","Memory flip game, match the pairs":"لعبة ذاكرة: اقلب وطابق الأزواج","Guess the Word":"خمّن الكلمة","Guess letters before the lamp goes out":"خمّن الحروف قبل أن ينطفئ المصباح",
"Crossword":"كلمات متقاطعة","Auto-built crossword from your words":"كلمات متقاطعة تُبنى من كلماتك","Picture Guess":"خمّن الصورة","The picture is revealed piece by piece":"تظهر الصورة قطعة قطعة","Pick a template, fill it in, and it's ready":"اختر قالباً واملأه وتصبح اللعبة جاهزة",
"No games yet. Pick a template above to make your first one ✨":"لا ألعاب بعد. اختر قالباً من الأعلى لتصنع لعبتك الأولى ✨","Live class games":"ألعاب مباشرة للفصل","Self play games":"ألعاب فردية","My games":"ألعابي","Team":"الفريق","Waiting":"في الانتظار",
"Games are saved on this phone. Tap Publish on a Ready self play game to show it in the kids' Games tab.":"الألعاب محفوظة على هذا الهاتف. اضغط نشر على لعبة فردية جاهزة لتظهر في تبويب ألعاب الأطفال.","Nobody is waiting 👍":"لا أحد في الانتظار 👍","Type the code from your servant or the big screen":"اكتب الرمز من خادمك أو من الشاشة الكبيرة","Big screen":"الشاشة الكبيرة",
"Attendance each Sunday":"الحضور في كل أحد","Building the report...":"جارٍ إعداد التقرير...","Choose a class":"اختر فصلاً","Class for the CSV":"الفصل لملف CSV","Date range":"الفترة","Level":"المستوى","Last 8 Sundays":"آخر 8 آحاد","last 8":"آخر 8","coloring pages":"صفحات تلوين","daily verses":"آيات يومية","stars earned":"نجوم مكتسبة",
"Add the first worksheet or craft link.":"أضف أول ورقة عمل أو رابط أشغال.","The library is empty":"المكتبة فارغة","Search the library":"ابحث في المكتبة","Links only. Put files in Google Drive, set sharing to \"Anyone with the link\", and paste the link here.":"روابط فقط. ضع الملفات في جوجل درايف واجعل المشاركة \"أي شخص لديه الرابط\" ثم الصق الرابط هنا.",
"In the print window choose \"Save as PDF\" as the printer.":"في نافذة الطباعة اختر \"حفظ كملف PDF\" كطابعة.","No competition result this month.":"لا نتيجة مسابقة هذا الشهر.","No events this month.":"لا فعاليات هذا الشهر.","Android: Chrome menu, then \"Add to Home screen\". iPhone: Safari Share button, then \"Add to Home Screen\".":"أندرويد: قائمة كروم ثم \"إضافة إلى الشاشة الرئيسية\". آيفون: زر المشاركة في سفاري ثم \"إضافة إلى الشاشة الرئيسية\".",
"Open any lesson and tap \"Copy link\" to send it to parents on WhatsApp.":"افتح أي درس واضغط \"انسخ الرابط\" لإرساله على واتساب.","Video":"فيديو"
});
Object.assign(D,{"Privacy policy":"سياسة الخصوصية","Delete my account":"حذف حسابي"});
Object.assign(D,window.HV_AR_EXTRA||{});
const WD={"Sunday":"الأحد","Monday":"الإثنين","Tuesday":"الثلاثاء","Wednesday":"الأربعاء","Thursday":"الخميس","Friday":"الجمعة","Saturday":"السبت","Sun":"الأحد","Mon":"الإثنين","Tue":"الثلاثاء","Wed":"الأربعاء","Thu":"الخميس","Fri":"الجمعة","Sat":"السبت"};
const MO={"January":"يناير","February":"فبراير","March":"مارس","April":"أبريل","May":"مايو","June":"يونيو","July":"يوليو","August":"أغسطس","September":"سبتمبر","October":"أكتوبر","November":"نوفمبر","December":"ديسمبر","Jan":"يناير","Feb":"فبراير","Mar":"مارس","Apr":"أبريل","Jun":"يونيو","Jul":"يوليو","Aug":"أغسطس","Sep":"سبتمبر","Oct":"أكتوبر","Nov":"نوفمبر","Dec":"ديسمبر"};
const CO={"Tout":"توت","Baba":"بابه","Hator":"هاتور","Kiahk":"كيهك","Toba":"طوبة","Amshir":"أمشير","Baramhat":"برمهات","Baramouda":"برمودة","Bashans":"بشنس","Paoni":"بؤونة","Epep":"أبيب","Mesori":"مسرى","Nasie":"النسيء"};
const GR={"Pre K":"تمهيدي","KG":"حضانة"};
/* patterns for text with numbers or names: [regex, replacement] */
const tr2=s=>window.hvTr?window.hvTr(s):s;
const P=[
[/^My gallery \((\d+)\)$/,"معرضي ($1)"],[/^My games \((\d+)\)$/,"ألعابي ($1)"],[/^Team \((\d+)\)$/,"الفريق ($1)"],[/^My verse jar \((\d+)\)$/,"مرطبان آياتي ($1)"],[/^Waiting \((\d+)\)$/,"في الانتظار ($1)"],[/^New this month: (\d+)$/,"جدد هذا الشهر: $1"],[/^Last (\d+) Sundays$/,"آخر $1 آحاد"],[/^(.+) · All classes$/,(m,a)=>a+" · كل الفصول"],[/^Servant · Hasn't come for 3 Sundays$/,"خادم · لم يحضر منذ 3 آحاد"],[/^▲ (\d+) points vs last month$/,"▲ $1 نقطة عن الشهر الماضي"],[/^▼ (\d+) vs last month$/,"▼ $1 عن الشهر الماضي"],[/^▲ (\d+) vs last month$/,"▲ $1 عن الشهر الماضي"],
[/^(.+) begins$/,(m,a)=>(D[a]?D[a]+" يبدأ":m)],[/^Learn about (.+)$/,(m,a)=>"تعرّف على "+tr2(a)],[/^Next saint: (.+) in (\d+) days$/,(m,a,n)=>"القديس التالي: "+tr2(a)+" بعد "+n+" يوم"],
[/^(.+), (Common|Rare|Legendary), (\d+) stars$/,(m,a,r,n)=>tr2(a)+"، "+(r==="Common"?"شائع":r==="Rare"?"نادر":"أسطوري")+"، "+n+" نجمة"],[/^(.+), (Common|Rare|Legendary), owned$/,(m,a,r)=>tr2(a)+"، "+(r==="Common"?"شائع":r==="Rare"?"نادر":"أسطوري")+"، ملكك"],
[/^(\d+) new notifications$/,"$1 إشعار جديد"],[/^(\d+) hours?(?: · (all night|good for tonight))?$/,(m,n,w)=>n+" ساعة"+(w==="all night"?" · طوال الليل":w?" · مناسب للّيلة":"")],[/^(\d+) questions$/,"$1 أسئلة"],[/^(\d+) lessons? · (\d+) done ✅$/,"$1 درس · تمّ $2 ✅"],
[/^(\d+) lesson videos$/,"$1 فيديو دروس"],[/^(\d+) percent(?: attendance)?$/,"$1 بالمئة"],[/^Question (\d+) of (\d+)$/,"السؤال $1 من $2"],[/^Skin (\d)$/,"البشرة $1"],[/^Watch the videos \((\d+)\)$/,"شاهد الفيديوهات ($1)"],[/^(\d+) stars$/,"$1 نجمة"],
[/^Amazing! You came (\d+) of (\d+) Sundays! 🌟$/,"رائع! حضرت $1 من $2 أحد! 🌟"],[/^Great job! You came (\d+) of (\d+) Sundays! 🎉$/,"أحسنت! حضرت $1 من $2 أحد! 🎉"],[/^Good going! You came (\d+) of (\d+) Sundays\. Keep it up 💛$/,"جيد! حضرت $1 من $2 أحد. استمر 💛"],
[/^Thank you for serving faithfully\. (\d+) of (\d+) Sundays so far\.$/,"شكراً لخدمتك الأمينة. $1 من $2 أحد حتى الآن."],[/^(\d+) of (\d+) Sundays so far\. Every Sunday counts\.$/,"$1 من $2 أحد حتى الآن. كل أحد له قيمته."],[/^(\d+) of (\d+) Sundays so far\. We would love to see you this Sunday\.$/,"$1 من $2 أحد حتى الآن. نتمنى أن نراك هذا الأحد."],
[/^(.+) · Tap to learn it$/,(m,a)=>tr2(a)+" · اضغط لتحفظها"],[/^(.+) · Done today! Open your verse jar$/,(m,a)=>tr2(a)+" · تمّت اليوم! افتح مرطبان آياتك"],[/^Sundays in a row · (\d+) Sundays in a row$/,"$1 آحاد متتالية"],[/^(.+) more to (.+)$/,(m,n,l)=>n+" أخرى لتصل إلى "+tr2(l)],
[/^Hi (.+)!$/,"أهلاً $1!"],[/^(\d+) days? in a row$/,"$1 يوم متتالٍ"],[/^in (\d+) days?$/,"بعد $1 يوم"],[/^Grade (\d+)$/,"الصف $1"],[/^Stops in (\d+) min$/,"يتوقف بعد $1 دقيقة"],[/^(\d+) days left this month$/,"باقٍ $1 يوم هذا الشهر"],
[/^(\d+) of (\d+) followed up this month$/,"$1 من $2 تمت متابعتهم هذا الشهر"],[/^(\d+) lessons?$/,"$1 درس"],[/^(\d+) videos?$/,"$1 فيديو"],[/^(\d+) kids$/,"$1 طفل"],[/^(\d+) stars? per kid$/,"$1 نجمة لكل طفل"],[/^(\d+) more stars to (.+)$/,(m,n,l)=>n+" نجمة أخرى لتصل إلى "+tr2(l)],
[/^(\d+) earned in total$/,"$1 مجموع ما كسبت"],[/^You came (\d+) of (\d+) Sundays\b.*$/,"حضرت $1 من $2 أحد"],[/^(\d+) of (\d+) Sundays so far\..*$/,"$1 من $2 أحد حتى الآن"],[/^(\d+) checked in today:?$/,"$1 سجّلوا حضورهم اليوم"],
[/^(\d+) days? at Sunday School\. Keep it up!$/,"$1 يوم في مدرسة الأحد. استمر!"],[/^Joined (.+)$/,"انضم في $1"],[/^Last here (.+)$/,"آخر حضور $1"],[/^Not here yet$/,"لم يحضر بعد"],[/^(\d+) kids here (.+)$/,"$1 طفل حضروا $2"],[/^of (\d+)$/,"من $1"],
[/^(\d+) servants\. Average attendance (.+)\. (\d+) are at 80% or more\.$/,"$1 خادم. متوسط الحضور $2. و$3 منهم 80% فأكثر."],[/^(\d+) kids needed a follow up\. (\d+) were contacted or visited this month\.$/,"$1 طفل احتاجوا متابعة. تم الاتصال أو الزيارة لـ $2 هذا الشهر."],
[/^Score = (\d+)% attendance \+ (\d+)% stars per kid.*$/,"الدرجة = $1% حضور + $2% نجوم لكل طفل. هكذا تتنافس الفصول الصغيرة والكبيرة بإنصاف."],[/^Attendance (.+) · (.+) stars per kid · (\d+) kids$/,"الحضور $1 · $2 نجمة لكل طفل · $3 طفل"],
[/^Coming in Phase (\d+)$/,"قريباً"],[/^(.+) days? ago$/,"منذ $1"],[/^(\d+) min ago$/,"منذ $1 دقيقة"],[/^(\d+) hours ago$/,"منذ $1 ساعة"],[/^just now$/,"الآن"],[/^New: (.+)$/,"جديد: $1"],[/^New game: (.+)$/,"لعبة جديدة: $1"],
[/^(.+) is tomorrow$/,"$1 غداً"],[/^Level up! You are a (.+)$/,"ترقية! أنت الآن $1"],[/^\+(\d+) stars ⭐$/,"+$1 نجمة ⭐"],[/^Step (\d) of (\d)\. (.+)$/,"الخطوة $1 من $2. $3"],[/^(.+) won the (.+) competition$/,"فاز $1 بمسابقة $2"],
[/^(\d+) of (\d+) kids?$/,"$1 من $2 طفل"],[/^You have (\d+) ⭐\. After buying: (\d+) ⭐$/,"لديك $1 ⭐. بعد الشراء: $2 ⭐"],[/^Need (\d+) more stars$/,"تحتاج $1 نجمة أخرى"],[/^(\d+) ⭐$/,"$1 ⭐"],
[/^Class: (.+)$/,"الفصل: $1"],[/^This goes to (.+)\.$/,"سيصل هذا إلى $1."],[/^Marked: (.+)$/,"المحدّد: $1"],[/^See all \((\d+)\)$/,"عرض الكل ($1)"],[/^(\d+) of (\d+) earned$/,"$1 من $2 مكتسبة"],[/^(\d+) of (\d+) Sundays$/,"$1 من $2 أحد"],
[/^Made (.+) · Glory be to God forever\. Amen\. ✝$/,"أُعدّ في $1 · له المجد إلى الأبد. آمين ✝"],[/^(\d+) (?:stars|points) earned$/,"$1 نجمة مكتسبة"]
];
const MISSING=new Set();window.hvMissing=()=>[...MISSING].sort();
const lat=/[A-Za-z]{3,}/;
const collapse=s=>s.replace(/\s+/g," ").trim();
function words(s){return s.replace(/\b(Pre K|KG)\b/g,m=>GR[m]).replace(/\bGrade (\d+)\b/g,"الصف $1").replace(/\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/g,m=>WD[m])
  .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b(?=\s*\d|,|\s*$)/g,m=>MO[m]).replace(/\b(Tout|Baba|Hator|Kiahk|Toba|Amshir|Baramhat|Baramouda|Bashans|Paoni|Epep|Mesori|Nasie)\b/g,m=>CO[m])}
const EDGE=/^([^A-Za-z0-9؀-ۿ]*)([\s\S]*?)([^A-Za-z0-9؀-ۿ.!?)]*)$/u;
function bibleRef(k){
  const m=k.match(/^((?:[123] )?(?:Song of Solomon|[A-Z][a-z]+)) (\d+)/);
  if(!m||!D[m[1]])return;
  return k.replace(/((?:[123] )?(?:Song of Solomon|[A-Z][a-z]+))(?= \d)/g,b=>D[b]||b).replace(/ to /g," إلى ").replace(/ and /g," و")}
function tr(raw){
  if(!raw||!/[A-Za-z]/.test(raw))return raw;
  const lead=raw.match(/^\s*/)[0],trail=raw.match(/\s*$/)[0],key=collapse(raw);if(!key)return raw;
  let out=D[key];
  if(out===undefined){const m=key.match(EDGE),pre=m[1],core=m[2],post=m[3];
    if(core&&core!==key){let c=D[core];if(c===undefined)for(const [re,rep] of P)if(re.test(core)){c=core.replace(re,rep);break}if(c!==undefined)out=pre+c+post}}
  if(out===undefined)out=bibleRef(key);
  if(out===undefined)for(const [re,rep] of P)if(re.test(key)){out=key.replace(re,rep);break}
  if(out===undefined){const dateLike=key.length<=40&&(/[0-9]/.test(key)||/^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat|January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Pre K|KG|Tout|Baba|Hator|Kiahk|Toba|Amshir|Baramhat|Baramouda|Bashans|Paoni|Epep|Mesori|Nasie)$/.test(key));const w=dateLike?words(key):key;if(w!==key)out=w;else if(lat.test(key)&&!/^(https?:|www\.)|@|\.(com|org|net)/.test(key))MISSING.add(key)}
  if(out===undefined)return raw;
  return lead+words(out).replace(/\b(\d+)\b/g,"$1")+trail}
const SKIP=new Set(["SCRIPT","STYLE","TEXTAREA","CODE","NOSCRIPT"]);
const ATTR=["aria-label","placeholder","title","alt"];
function walk(root){
  if(!root)return;
  if(root.nodeType===3){const p=root.parentNode;if(p&&!SKIP.has(p.nodeName)&&!(p.closest&&p.closest(".notr"))){const v=tr(root.nodeValue);if(v!==root.nodeValue)root.nodeValue=v}return}
  if(root.nodeType!==1||SKIP.has(root.nodeName)||root.classList&&root.classList.contains("notr"))return;
  ATTR.forEach(a=>{if(root.hasAttribute&&root.hasAttribute(a)){const v=tr(root.getAttribute(a));if(v!==root.getAttribute(a))root.setAttribute(a,v)}});
  if(root.nodeName==="INPUT"&&/^(button|submit)$/.test(root.type)){const v=tr(root.value);if(v!==root.value)root.value=v}
  for(let c=root.firstChild;c;c=c.nextSibling)walk(c);
  if(root.shadowRoot)walk(root.shadowRoot)}
window.hvTr=tr;
function start(){
  const body=document.body;if(!body)return;
  document.title=tr(document.title)||document.title;
  walk(body);
  new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(n=>walk(n))}}).observe(body,{childList:true,subtree:true});
}
if(document.body)start();else document.addEventListener("DOMContentLoaded",start);
/* the calendar and charts ask for Arabic weekday letters */
window.hvWeekdayInitials=()=>["ح","ن","ث","ر","خ","ج","س"];
})();
