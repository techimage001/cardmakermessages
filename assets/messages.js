(() => {
  const occasions = {
    birthday: {
      label: 'Birthday', front: 'Happy Birthday', icon: '✦',
      messages: [
        ['heartfelt','May your birthday bring you the same warmth, encouragement and happiness you give so freely to everyone around you.'],
        ['heartfelt','Today is a lovely chance to celebrate you and all the quiet, wonderful ways you make life better for the people who know you.'],
        ['short','Wishing you a very happy birthday and a year filled with good things.'],
        ['short','Happy birthday. I hope your day feels every bit as special as you are.'],
        ['funny','Another birthday, another excellent reason to eat cake before making any sensible decisions.'],
        ['funny','You are not getting older. You are becoming a limited edition with excellent stories.'],
        ['formal','Warmest wishes for a happy birthday and every success in the year ahead.'],
        ['religious','May God bless your birthday with peace, joy and renewed strength for the year ahead.'],
        ['inspirational','May this new chapter bring brave beginnings, meaningful progress and many reasons to be proud.'],
        ['romantic','Happy birthday to the person who makes ordinary days feel brighter simply by being there.']
      ]
    },
    christmas: {
      label: 'Christmas', front: 'Merry Christmas', icon: '❄',
      messages: [
        ['heartfelt','May your Christmas be filled with the comfort of home, the joy of togetherness and memories you will treasure.'],
        ['short','Wishing you a peaceful Christmas and a bright, happy New Year.'],
        ['short','Merry Christmas with warm wishes for you and everyone you love.'],
        ['funny','May your Christmas be merry, your snacks plentiful and your batteries already included.'],
        ['formal','Season’s greetings and best wishes for a peaceful Christmas and a successful New Year.'],
        ['religious','May the hope and peace of Christ fill your heart and home throughout this Christmas season.'],
        ['heartfelt','Thinking of you at Christmas and sending love across every mile between us.'],
        ['professional','Thank you for your support throughout the year. Wishing you a restful Christmas and continued success.'],
        ['inspirational','May Christmas renew your hope and lead you into the New Year with courage and gratitude.'],
        ['romantic','Christmas feels warmer, brighter and more meaningful because I get to share it with you.']
      ]
    },
    wedding: {
      label: 'Wedding', front: 'Congratulations', icon: '♡',
      messages: [
        ['heartfelt','May your marriage be a safe place for laughter, honesty, patience and a love that keeps choosing each other.'],
        ['short','Congratulations on your wedding. Wishing you a lifetime of love and happiness together.'],
        ['formal','Warmest congratulations on your marriage, with every good wish for your future together.'],
        ['religious','May God guide your marriage, strengthen your love and bless the home you build together.'],
        ['funny','Marriage is finding one special person to lovingly ask what you want for dinner for the rest of your lives.'],
        ['inspirational','May you grow side by side, dream boldly and make every season of life stronger together.'],
        ['heartfelt','What a joy to see two wonderful people begin this beautiful new chapter together.'],
        ['short','Here is to love, friendship and a lifetime of shared adventures.'],
        ['formal','Please accept our sincere congratulations and best wishes on this very happy occasion.'],
        ['romantic','May the love you celebrate today deepen through every ordinary and extraordinary day ahead.']
      ]
    },
    anniversary: {
      label: 'Anniversary', front: 'Happy Anniversary', icon: '∞',
      messages: [
        ['heartfelt','Your life together is a beautiful reminder that lasting love is built in thousands of thoughtful, everyday moments.'],
        ['short','Happy anniversary. Wishing you many more happy years together.'],
        ['romantic','I would choose you again in every season, every version of life and every ordinary day.'],
        ['funny','Another year of love, laughter and deciding what to watch. You are clearly doing something right.'],
        ['formal','Warm congratulations on your anniversary and best wishes for many more years of happiness.'],
        ['religious','May God continue to bless your marriage with grace, unity and enduring love.'],
        ['inspirational','May the years ahead hold new dreams while keeping the best parts of your journey close.'],
        ['heartfelt','The love you share has created a home in which so many people feel welcome and cared for.'],
        ['short','Celebrating your love and the wonderful life you have built together.'],
        ['romantic','Every year with you gives me more reasons to be grateful that our paths became one.']
      ]
    },
    easter: {
      label: 'Easter', front: 'Happy Easter', icon: '☼',
      messages: [
        ['heartfelt','Wishing you an Easter filled with renewed hope, peaceful moments and the happiness of being with those you love.'],
        ['short','Happy Easter. May your day be peaceful, bright and full of joy.'],
        ['religious','May the risen Christ fill your heart with hope, your home with peace and your life with new purpose.'],
        ['religious','Celebrating the promise of Easter and sending prayers for grace, strength and lasting joy.'],
        ['funny','Wishing you an egg-cellent Easter with enough chocolate to make counting completely unnecessary.'],
        ['formal','Warm wishes for a peaceful and joyful Easter celebration.'],
        ['inspirational','May Easter remind you that new beginnings can rise from the hardest seasons.'],
        ['heartfelt','Thinking of you this Easter and sending warm wishes for a gentle, hopeful spring.'],
        ['short','May hope bloom brightly for you this Easter.'],
        ['professional','Wishing you and your family a restful Easter and a refreshing break.']
      ]
    },
    thanks: {
      label: 'Thank You', front: 'Thank You', icon: '♥',
      messages: [
        ['heartfelt','Thank you for showing up with kindness when it mattered most. Your support meant more than I can properly express.'],
        ['short','Thank you so much. Your thoughtfulness was truly appreciated.'],
        ['formal','Please accept my sincere thanks for your time, support and generosity.'],
        ['professional','Thank you for your valuable contribution and for making the process so much easier.'],
        ['funny','Thank you. I owe you one, and I promise to remember that before asking for another favour.'],
        ['religious','Thank you for being such a blessing. May God reward your kindness and generosity.'],
        ['heartfelt','Your help brought calm to a difficult moment, and I will always remember it.'],
        ['short','A small card for a very big thank you.'],
        ['inspirational','Your generosity reminded me how powerful one thoughtful action can be.'],
        ['formal','With genuine appreciation for everything you have done.']
      ]
    },
    congratulations: {
      label: 'Congratulations', front: 'Well Done', icon: '★',
      messages: [
        ['heartfelt','Congratulations. This achievement reflects your patience, effort and the courage to keep going when progress felt slow.'],
        ['short','Congratulations on a wonderful achievement. You should be very proud.'],
        ['funny','Congratulations. All that hard work has officially made you look suspiciously talented.'],
        ['formal','Please accept my warmest congratulations on this well-deserved achievement.'],
        ['professional','Congratulations on reaching this important milestone. Wishing you continued success.'],
        ['religious','Congratulations. May God guide your next steps and bless the opportunities ahead.'],
        ['inspirational','Celebrate how far you have come, then carry that confidence into the next challenge.'],
        ['heartfelt','It has been wonderful to watch your hard work turn into something worth celebrating.'],
        ['short','You did it. Congratulations and enjoy every moment.'],
        ['formal','Warm congratulations and every good wish for the future.']
      ]
    },
    'new-baby': {
      label: 'New Baby', front: 'Welcome, Little One', icon: '✧',
      messages: [
        ['heartfelt','Congratulations on your beautiful new arrival. May your home be filled with gentle moments, growing love and many happy firsts.'],
        ['short','Congratulations on your new baby. Wishing your family love, health and happiness.'],
        ['funny','Congratulations on your adorable new manager. The hours are demanding, but the cuddles are excellent.'],
        ['formal','Warmest congratulations on the safe arrival of your baby and best wishes to your family.'],
        ['religious','May God bless your precious baby with health, peace and a life surrounded by love.'],
        ['inspirational','A tiny new life has opened a whole new world of love, wonder and possibility.'],
        ['heartfelt','Your little one is already deeply loved and wonderfully welcome.'],
        ['short','Welcome to the world, little one. You are loved beyond words.'],
        ['formal','With sincere congratulations and warm wishes at this joyful time.'],
        ['religious','May this child grow in wisdom, grace and the loving care of family.']
      ]
    },
    retirement: {
      label: 'Retirement', front: 'Happy Retirement', icon: '☀',
      messages: [
        ['heartfelt','Your work has made a lasting difference, and your kindness will be remembered long after the meetings and deadlines are forgotten.'],
        ['short','Happy retirement. Wishing you rest, freedom and many enjoyable adventures.'],
        ['funny','Congratulations on retiring. Your new full-time job is deciding what not to do today.'],
        ['formal','Warmest congratulations on your retirement and sincere thanks for your years of service.'],
        ['professional','Your experience, commitment and steady support have made a real contribution. Enjoy a well-earned retirement.'],
        ['religious','May God bless this new season with good health, renewed purpose and peaceful days.'],
        ['inspirational','Retirement is not the end of meaningful work. It is the beginning of choosing what matters most.'],
        ['heartfelt','You leave behind more than completed work. You leave encouragement, example and many grateful colleagues.'],
        ['short','Here is to fewer alarms and more time for everything you enjoy.'],
        ['formal','With appreciation and every good wish for a fulfilling retirement.']
      ]
    },
    'get-well': {
      label: 'Get Well', front: 'Thinking of You', icon: '✿',
      messages: [
        ['heartfelt','Thinking of you and hoping each day brings a little more strength, comfort and confidence in your recovery.'],
        ['short','Sending warm wishes for rest, healing and a steady recovery.'],
        ['funny','Get well soon. Being unwell is a terrible excuse for avoiding my messages.'],
        ['formal','Wishing you a comfortable recovery and a return to good health very soon.'],
        ['professional','We are thinking of you and wishing you the time and rest needed for a full recovery.'],
        ['religious','May God surround you with peace, renew your strength and carry you through each day of recovery.'],
        ['inspirational','Recovery can be slow, but every small step still counts as progress.'],
        ['heartfelt','There is no pressure to reply. Just know that you are cared for and often in my thoughts.'],
        ['short','Rest well, take your time and know that you are missed.'],
        ['religious','Sending prayers for comfort, skilled care and renewed health.']
      ]
    },
    valentine: {
      label: 'Valentine’s Day', front: 'Happy Valentine’s Day', icon: '♥',
      messages: [
        ['romantic','Life is not perfect, but loving you has made it richer, warmer and more beautiful than I imagined.'],
        ['short','Happy Valentine’s Day to my favourite person.'],
        ['funny','I love you even when you steal the covers, which is very strong evidence.'],
        ['heartfelt','Thank you for being the person I can laugh with, lean on and feel completely at home beside.'],
        ['romantic','You are still the person I look for first in every room and want beside me at the end of every day.'],
        ['formal','With warm affection and every good wish on Valentine’s Day.'],
        ['religious','I thank God for the love, friendship and grace we share. Happy Valentine’s Day.'],
        ['inspirational','The best love helps both people become more fully themselves. Thank you for growing with me.'],
        ['short','You make ordinary life feel extraordinary.'],
        ['funny','You are my favourite notification, snack-sharing partner and lifelong inconvenience.']
      ]
    },
    graduation: {
      label: 'Graduation', front: 'Congratulations, Graduate', icon: '◆',
      messages: [
        ['heartfelt','Congratulations on your graduation. This day reflects years of determination, sacrifice and faith in what you could become.'],
        ['short','Congratulations, graduate. Your hard work has paid off beautifully.'],
        ['funny','You graduated. Now you can confidently pretend to understand forms, taxes and group emails.'],
        ['formal','Warmest congratulations on your graduation and best wishes for your future career.'],
        ['professional','Congratulations on reaching this important academic milestone. May it open many rewarding opportunities.'],
        ['religious','May God guide your decisions, open the right doors and give purpose to everything you have learned.'],
        ['inspirational','Your qualification is an achievement, but your curiosity and resilience will carry you even further.'],
        ['heartfelt','We are proud not only of what you achieved, but of the person you became while earning it.'],
        ['short','Celebrate today. You earned every bit of this moment.'],
        ['formal','With sincere congratulations and every good wish for the journey ahead.']
      ]
    },
    'mothers-day': {
      label: 'Mother’s Day', front: 'For a Wonderful Mum', icon: '❀',
      messages: [
        ['heartfelt','Thank you for the countless ordinary things you do that make life feel safer, warmer and more loved.'],
        ['short','Happy Mother’s Day. I hope today brings you the care you give so freely.'],
        ['funny','Happy Mother’s Day. Today, every cup of tea should arrive hot and without you making it.'],
        ['formal','With warm appreciation and every good wish on Mother’s Day.'],
        ['religious','May God bless you for the love, wisdom and patient care you have poured into our family.'],
        ['inspirational','Your strength has shaped more lives than you may ever fully see.'],
        ['heartfelt','You have been a steady source of encouragement, care and love, and I am deeply grateful for you.'],
        ['short','With love and gratitude on Mother’s Day.'],
        ['religious','May your day be filled with peace, joy and the blessing you have given to others.'],
        ['funny','Thank you for knowing where everything is, even when nobody has looked properly.']
      ]
    },

    'fathers-day': {
      label: 'Father’s Day', front: 'Happy Father’s Day', icon: '◇',
      messages: [
        ['heartfelt','Thank you for the calm advice, practical help and steady encouragement you have given me over the years.'],
        ['short','Wishing you a very happy Father’s Day and a day filled with the things you enjoy most.'],
        ['funny','Happy Father’s Day to the person who taught me that almost anything can be fixed with patience and the right tool.'],
        ['formal','With sincere appreciation for your guidance, example and constant support. Happy Father’s Day.'],
        ['religious','May God bless you for the strength, wisdom and care you have shared with our family.'],
        ['inspirational','Your example has shown me that real strength can be patient, kind and dependable.'],
        ['heartfelt','You have been a steady presence, a thoughtful guide and someone I can always rely on.'],
        ['short','With love and appreciation on Father’s Day.'],
        ['professional','Wishing you a happy Father’s Day and a well-deserved day of rest and appreciation.'],
        ['funny','Today is your official permission to repeat your best stories and control the remote.']
      ]
    },
    'child-naming': {
      label: 'Child Naming Ceremony', front: 'Welcome, Little One', icon: '✧',
      messages: [
        ['heartfelt','Welcome, little one. May your name always be spoken with love and your life be surrounded by people who help you grow with confidence.'],
        ['short','Warmest congratulations on this beautiful naming ceremony and joyful family occasion.'],
        ['formal','Please accept our sincere congratulations to the child and family on this meaningful celebration.'],
        ['religious','May God guide this precious child, protect every step and fill the years ahead with grace and purpose.'],
        ['inspirational','Today a beautiful name is celebrated, and a lifetime of possibility begins.'],
        ['heartfelt','May this child grow in wisdom, good health and the security of a family that celebrates every step.'],
        ['short','Welcome to a life of love, belonging and wonderful new beginnings.'],
        ['religious','May this child be surrounded by faithful love, wise guidance and lasting peace.'],
        ['formal','With warm wishes to the whole family on the child’s naming ceremony.'],
        ['inspirational','May the meaning carried in this name be matched by a life of courage, kindness and purpose.']
      ]
    },
    'job-promotion': {
      label: 'Job Promotion', front: 'Congratulations on Your Promotion', icon: '↑',
      messages: [
        ['heartfelt','Congratulations on your promotion. Your judgement, consistency and willingness to support others have made this achievement thoroughly deserved.'],
        ['short','Warmest congratulations on your new role and this well-earned next step.'],
        ['funny','You have officially been promoted from answering questions to receiving even more questions. Congratulations.'],
        ['formal','Please accept my sincere congratulations on this well-earned professional achievement.'],
        ['professional','Congratulations on your promotion. Wishing you confidence, success and rewarding opportunities in the new role.'],
        ['religious','May God give you wisdom, favour and strength as you take on this new responsibility.'],
        ['inspirational','This promotion recognises what your hard work has already shown: you are ready for the next level.'],
        ['heartfelt','It is wonderful to see your effort, character and patience recognised in such a meaningful way.'],
        ['short','Congratulations. You earned this moment and the opportunity ahead.'],
        ['professional','Your leadership and dependable contribution have prepared you well for this next chapter.']
      ]
    },
    custom: {
      label: 'Custom Occasion', front: 'A Special Message', icon: '+',
      messages: [
        ['heartfelt','This moment deserves to be marked with warmth, gratitude and a message made especially for you.'],
        ['short','Warm wishes for this special occasion.'],
        ['funny','This occasion called for a card, so here is one made especially for you.'],
        ['formal','Please accept my warmest wishes on this special occasion.'],
        ['professional','With sincere congratulations and every good wish for the occasion.'],
        ['religious','May God bless this occasion and guide every step that follows.'],
        ['inspirational','May this moment become the beginning of something meaningful and rewarding.'],
        ['heartfelt','I am grateful to share this important moment and celebrate it with you.'],
        ['short','Celebrating this special moment with you.'],
        ['formal','With warm regards and best wishes for this memorable occasion.']
      ]
    },
    'birthday-invitation': {
      label: 'Birthday Invitation', front: 'You’re Invited', icon: '✦',
      messages: [
        ['heartfelt','Please join us to celebrate a very special birthday with good company, happy memories and plenty of laughter.'],
        ['short','You’re invited to celebrate a special birthday with us.'],
        ['funny','Cake has been ordered, candles have been counted and your presence is required.'],
        ['formal','You are warmly invited to join us for a birthday celebration.'],
        ['professional','Please join us as we celebrate this special birthday milestone.'],
        ['inspirational','Come celebrate another year of growth, memories and new beginnings.'],
        ['heartfelt','It would mean so much to celebrate this birthday surrounded by people who matter.'],
        ['short','Save the date and come celebrate with us.'],
        ['formal','Kindly join us for an evening of celebration in honour of this birthday.'],
        ['funny','Good people, good food and one person pretending the age does not matter.']
      ]
    },
    'party-invitation': {
      label: 'Party Invitation', front: 'Let’s Celebrate', icon: '✹',
      messages: [
        ['heartfelt','We would love you to join us for a joyful celebration with good food, warm company and memorable moments.'],
        ['short','You’re invited. Come celebrate with us.'],
        ['funny','Clear your calendar. There will be food, music and questionable dancing.'],
        ['formal','You are warmly invited to attend our celebration.'],
        ['professional','Please join us for a special event and an enjoyable time together.'],
        ['inspirational','Life gives us moments worth gathering for. Come celebrate this one with us.'],
        ['heartfelt','Your presence would make this celebration even more special.'],
        ['short','Save the date. We would love to see you there.'],
        ['formal','Kindly join us for an evening of celebration and fellowship.'],
        ['funny','The party will be better with you there, and the snacks will disappear either way.']
      ]
    },
    'wedding-invitation': {
      label: 'Wedding Invitation', front: 'Together with Joy', icon: '◇',
      messages: [
        ['heartfelt','With joyful hearts, we invite you to share in the celebration as we begin our married life together.'],
        ['short','Please join us as we celebrate our wedding.'],
        ['formal','Together with their families, the couple request the pleasure of your company at their wedding.'],
        ['religious','With gratitude to God, we invite you to witness and celebrate our marriage.'],
        ['professional','You are warmly invited to join us for our wedding ceremony and celebration.'],
        ['inspirational','Two lives, one promise and a new chapter to celebrate together.'],
        ['heartfelt','It would mean so much to have you with us as we exchange our vows.'],
        ['short','Save the date for a beautiful beginning.'],
        ['formal','The honour of your presence is requested at the marriage celebration.'],
        ['religious','Please join us as we seek God’s blessing and celebrate our union.']
      ]
    },
    'christmas-invitation': {
      label: 'Christmas Invitation', front: 'A Festive Invitation', icon: '❄',
      messages: [
        ['heartfelt','Please join us for a warm Christmas gathering filled with good food, friendship and festive cheer.'],
        ['short','You’re invited to celebrate Christmas with us.'],
        ['funny','Bring your festive spirit. We will provide the food and at least one terrible jumper.'],
        ['formal','You are warmly invited to our Christmas celebration.'],
        ['professional','Please join us for a seasonal gathering as we celebrate the close of the year.'],
        ['religious','Please join us as we celebrate the hope and joy of Christmas together.'],
        ['heartfelt','Christmas feels brighter when shared with people we value. We would love you to be there.'],
        ['short','Save the date for a joyful Christmas gathering.'],
        ['formal','Kindly join us for an evening of seasonal hospitality and celebration.'],
        ['religious','Come share in fellowship, gratitude and the peace of the Christmas season.']
      ]
    },
    postcard: {
      label: 'Postcard', front: 'A Note from Me', icon: '▱',
      messages: [
        ['heartfelt','Thinking of you from afar and wishing you could share this beautiful moment with me.'],
        ['short','A little hello from here to you.'],
        ['funny','The view is lovely, the food is good and I am pretending I packed sensibly.'],
        ['formal','Warm greetings and best wishes from my travels.'],
        ['professional','Sending a brief note with warm regards and every good wish.'],
        ['inspirational','New places have a wonderful way of making familiar people feel even more precious.'],
        ['heartfelt','This place made me think of you, so I wanted to send a little piece of the moment.'],
        ['short','Wish you were here. Sending love.'],
        ['formal','With warm thoughts and sincere good wishes.'],
        ['funny','I came, I saw, I took far too many photos.']
      ]
    },
    'good-luck': {
      label: 'Good Luck', front: 'Good Luck', icon: '✦',
      messages: [
        ['heartfelt','You have prepared well and you are more ready than you feel. Wishing you every success.'],
        ['heartfelt','Whatever happens, the effort you have put in already says a great deal about you.'],
        ['short','Good luck. You have got this.'],
        ['short','Wishing you the very best of luck.'],
        ['formal','Wishing you every success in this next undertaking.'],
        ['inspirational','Trust your preparation, steady your nerves and let your ability speak for itself.']
      ]
    },
    'exam-success': {
      label: 'Exam Success', front: 'Well Done', icon: '★',
      messages: [
        ['heartfelt','Your results reflect months of steady work and genuine determination. Very well done.'],
        ['heartfelt','Congratulations. You earned this through effort that nobody else could have done for you.'],
        ['short','Well done on your exam results.'],
        ['short','Congratulations on a brilliant result.'],
        ['formal','Congratulations on an excellent set of examination results.'],
        ['inspirational','This result is proof of what focus and persistence can achieve. On to the next chapter.']
      ]
    },
    'driving-test': {
      label: 'Driving Test Passed', front: 'Congratulations', icon: '✦',
      messages: [
        ['heartfelt','Congratulations on passing. All those lessons and nervous practice runs were worth it.'],
        ['short','You passed. Congratulations.'],
        ['short','Well done on passing your driving test.'],
        ['funny','Congratulations on passing. The roads will never be the same again.'],
        ['formal','Congratulations on successfully passing your driving test.'],
        ['inspirational','A new licence and a new freedom. Enjoy every mile of it.']
      ]
    },
    'engagement': {
      label: 'Engagement', front: 'Congratulations', icon: '♡',
      messages: [
        ['heartfelt','Congratulations on your engagement. Wishing you a long and happy life together.'],
        ['heartfelt','What a joy to see two people so well suited choosing a future together.'],
        ['short','Congratulations on your engagement.'],
        ['short','So happy for you both.'],
        ['romantic','Here is to the love you have found and the life you are about to build.'],
        ['formal','Warmest congratulations to you both on your engagement.']
      ]
    },
    'friendship': {
      label: 'Friendship', front: 'Thinking of You', icon: '♥',
      messages: [
        ['heartfelt','Thank you for being the kind of friend who shows up, listens and stays.'],
        ['heartfelt','Friendship like yours is rare and I do not take a moment of it for granted.'],
        ['short','Just a note to say I am glad we are friends.'],
        ['short','Thinking of you and grateful for you.'],
        ['funny','You are the friend who knows too much about me to ever be allowed to leave.'],
        ['inspirational','Good friendship makes hard days lighter and good days better. Thank you for both.']
      ]
    },
    'sorry-apology': {
      label: 'Sorry and Apology', front: 'I Am Sorry', icon: '✿',
      messages: [
        ['heartfelt','I am truly sorry. I value you and I want to put this right.'],
        ['heartfelt','I have thought about it properly and I understand why it hurt. I am sorry.'],
        ['short','I am sorry. Truly.'],
        ['short','Please accept my sincere apology.'],
        ['formal','Please accept my sincere apologies for any difficulty this has caused.'],
        ['inspirational','Getting it wrong matters less than what we choose to do next. I want to do better.']
      ]
    },
    'divorce-new-beginnings': {
      label: 'Divorce and New Beginnings', front: 'A New Chapter', icon: '✧',
      messages: [
        ['heartfelt','This has not been easy and you have handled it with more grace than you know.'],
        ['heartfelt','A new chapter is still a beginning. I am here for whatever it brings.'],
        ['short','Thinking of you. Here for you.'],
        ['short','Here is to a brighter chapter ahead.'],
        ['inspirational','Endings can be the quiet beginning of something better. Take your time.'],
        ['formal','Wishing you strength and steadiness in this new chapter.']
      ]
    },
    'pregnancy': {
      label: 'Pregnancy', front: 'Congratulations', icon: '✧',
      messages: [
        ['heartfelt','What wonderful news. Wishing you a healthy, happy pregnancy.'],
        ['heartfelt','Congratulations. What an exciting time this must be for you both.'],
        ['short','Congratulations on your lovely news.'],
        ['short','So happy for you both.'],
        ['formal','Warmest congratulations on your happy news.'],
        ['religious','May God bless you with a safe and healthy pregnancy and a joyful arrival.']
      ]
    },
    'baby-shower': {
      label: 'Baby Shower', front: 'Welcome, Little One', icon: '✧',
      messages: [
        ['heartfelt','Wishing you every joy as you prepare to welcome your little one.'],
        ['short','Congratulations. Enjoy every moment.'],
        ['short','So excited for you both.'],
        ['funny','Enjoy the sleep while you still can. Congratulations.'],
        ['formal','Warmest wishes as you prepare to welcome your baby.'],
        ['religious','May your little one be blessed with health, joy and a loving home.']
      ]
    },
    'adoption': {
      label: 'Adoption', front: 'Welcome Home', icon: '♡',
      messages: [
        ['heartfelt','Congratulations. A family is built by love and you have built a wonderful one.'],
        ['heartfelt','What a beautiful thing, to open your home and your heart this way.'],
        ['short','Congratulations on your new arrival.'],
        ['short','Welcome home, little one.'],
        ['religious','May God bless your growing family with love, patience and joy.'],
        ['inspirational','Family is chosen as much as it is given. Congratulations on choosing so well.']
      ]
    },
    'new-home': {
      label: 'New Home', front: 'Happy New Home', icon: '⌂',
      messages: [
        ['heartfelt','Wishing you every happiness in the home you will fill with memories.'],
        ['short','Congratulations on your new home.'],
        ['short','Happy new home.'],
        ['funny','Congratulations on the new home and the many trips to the hardware shop ahead.'],
        ['formal','Warmest congratulations on your new home.'],
        ['religious','May your new home be blessed with peace, warmth and happiness.']
      ]
    },
    'housewarming': {
      label: 'Housewarming', front: 'Happy Housewarming', icon: '⌂',
      messages: [
        ['heartfelt','May this house be filled with laughter, good food and better company.'],
        ['short','Happy housewarming.'],
        ['short','Congratulations on the new place.'],
        ['funny','A new home means new rooms in which to lose things. Congratulations.'],
        ['formal','Warmest wishes on your new home.'],
        ['religious','May peace and blessing rest on this home and everyone within it.']
      ]
    },
    'new-job': {
      label: 'New Job', front: 'Congratulations', icon: '↑',
      messages: [
        ['heartfelt','Congratulations. They are fortunate to have someone with your ability joining them.'],
        ['heartfelt','A well-deserved step forward. Wishing you every success in the new role.'],
        ['short','Congratulations on the new job.'],
        ['short','Good luck in the new role.'],
        ['formal','Congratulations on your appointment and best wishes for continued success.'],
        ['inspirational','New rooms, new people, same capable you. Go and do well.']
      ]
    },
    'starting-university': {
      label: 'Starting University', front: 'Good Luck', icon: '✦',
      messages: [
        ['heartfelt','Wishing you a wonderful start, good friends and plenty of good memories.'],
        ['short','Good luck at university.'],
        ['short','Enjoy every moment of it.'],
        ['funny','Study hard, sleep occasionally and learn to cook at least two meals.'],
        ['formal','Best wishes as you begin your university studies.'],
        ['inspirational','New city, new ideas, new version of you. Make the most of all three.']
      ]
    },
    'welcome-back': {
      label: 'Welcome Back', front: 'Welcome Back', icon: '✦',
      messages: [
        ['heartfelt','It is genuinely good to have you back. You were missed.'],
        ['short','Welcome back.'],
        ['short','Good to have you back with us.'],
        ['formal','Welcome back. We are glad to have you with us again.'],
        ['funny','Welcome back. Your chair has been guarded fiercely in your absence.'],
        ['inspirational','Whatever took you away, it is good to see you return stronger.']
      ]
    },
    'thinking-of-you': {
      label: 'Thinking of You', front: 'Thinking of You', icon: '✿',
      messages: [
        ['heartfelt','Just a note to say you are in my thoughts and I am here if you need anything.'],
        ['heartfelt','No need to reply. I simply wanted you to know you are being thought of.'],
        ['short','Thinking of you.'],
        ['short','You are in my thoughts.'],
        ['religious','Praying for you and holding you in my thoughts today.'],
        ['inspirational','On the heavy days, remember that you are not carrying it alone.']
      ]
    },
    'sympathy': {
      label: 'Sympathy and Bereavement', front: 'With Deepest Sympathy', icon: '✿',
      messages: [
        ['heartfelt','I am so sorry for your loss. Please know you are being thought of with great care.'],
        ['heartfelt','There are no right words. I am simply here, and thinking of you.'],
        ['short','With deepest sympathy.'],
        ['short','So very sorry for your loss.'],
        ['formal','Please accept my sincere condolences on your loss.'],
        ['religious','May God comfort you and your family and grant you peace in this time.']
      ]
    },
    'pet-loss': {
      label: 'Pet Loss Sympathy', front: 'With Sympathy', icon: '✿',
      messages: [
        ['heartfelt','I am so sorry. They were family, and the loss is real and deep.'],
        ['heartfelt','What a lucky animal, to have been loved as well as that one was.'],
        ['short','So sorry for your loss.'],
        ['short','Thinking of you both.'],
        ['inspirational','The years of loyalty and comfort they gave do not disappear. They stay with you.'],
        ['formal','With sincere sympathy on the loss of your companion.']
      ]
    },
    'pregnancy-loss': {
      label: 'Pregnancy Loss Support', front: 'Thinking of You', icon: '✿',
      messages: [
        ['heartfelt','I am so deeply sorry. There is nothing to fix and nothing you need to say.'],
        ['heartfelt','Thinking of you both, with love, and for as long as you need.'],
        ['short','Thinking of you both.'],
        ['short','So very sorry. Here for you.'],
        ['religious','Praying for comfort, gentleness and peace for you both.'],
        ['formal','With heartfelt sympathy and warm thoughts for you both.']
      ]
    },
    'serious-illness': {
      label: 'Serious Illness Support', front: 'Thinking of You', icon: '✿',
      messages: [
        ['heartfelt','Thinking of you and sending strength. I am here for whatever helps.'],
        ['heartfelt','No pressure to respond. Just know that you are cared for and thought of daily.'],
        ['short','Thinking of you.'],
        ['short','Sending strength and love.'],
        ['religious','Praying for comfort, courage and healing for you.'],
        ['inspirational','One day at a time is not a small thing. It is exactly the right pace.']
      ]
    },
    'encouragement': {
      label: 'Encouragement', front: 'You Can Do This', icon: '✦',
      messages: [
        ['heartfelt','You have come through harder than this before and you will come through again.'],
        ['heartfelt','Do not measure yourself by your hardest week. You are doing better than you think.'],
        ['short','You have got this.'],
        ['short','Cheering you on.'],
        ['inspirational','Progress is rarely tidy. Keep going anyway.'],
        ['religious','May God give you strength, patience and peace for what lies ahead.']
      ]
    },
    'difficult-times': {
      label: 'Difficult Times', front: 'Thinking of You', icon: '✿',
      messages: [
        ['heartfelt','Difficult seasons do not last, even when they feel endless. I am here.'],
        ['heartfelt','You do not have to be strong for anyone right now, least of all me.'],
        ['short','Here for you, always.'],
        ['short','Thinking of you.'],
        ['religious','May you find comfort, strength and peace in this difficult time.'],
        ['inspirational','Take it one hour at a time if a day feels too long.']
      ]
    },
    'baptism': {
      label: 'Baptism', front: 'God Bless You', icon: '✝',
      messages: [
        ['religious','May God bless you today and always as you begin this journey of faith.'],
        ['religious','Wishing you every blessing on your baptism and in the years ahead.'],
        ['heartfelt','What a special day. Wishing you joy and blessing always.'],
        ['short','God bless you on your baptism.'],
        ['short','Congratulations on this special day.'],
        ['formal','Warmest wishes and blessings on the occasion of your baptism.']
      ]
    },
    'christening': {
      label: 'Christening', front: 'God Bless', icon: '✝',
      messages: [
        ['religious','May God watch over this precious child and bless them all their days.'],
        ['religious','Wishing your family every blessing on this special christening day.'],
        ['heartfelt','What a beautiful day for a beautiful little one. Congratulations.'],
        ['short','God bless the little one.'],
        ['short','Congratulations on the christening.'],
        ['formal','Warmest wishes and blessings on your child\'s christening.']
      ]
    },
    'first-communion': {
      label: 'First Holy Communion', front: 'God Bless You', icon: '✝',
      messages: [
        ['religious','May this day be the beginning of a lifetime of faith, grace and peace.'],
        ['religious','God bless you on your First Holy Communion and always.'],
        ['heartfelt','So proud of you on this very special day.'],
        ['short','Congratulations on your First Communion.'],
        ['short','God bless you today.'],
        ['formal','Warmest wishes on the occasion of your First Holy Communion.']
      ]
    },
    'confirmation': {
      label: 'Confirmation', front: 'God Bless You', icon: '✝',
      messages: [
        ['religious','May the Holy Spirit guide, strengthen and bless you all your life.'],
        ['religious','God bless you on your Confirmation and in every day that follows.'],
        ['heartfelt','So proud of you for choosing this path for yourself.'],
        ['short','Congratulations on your Confirmation.'],
        ['short','God bless you always.'],
        ['formal','Warmest wishes and blessings on your Confirmation.']
      ]
    },
    'pastor-appreciation': {
      label: 'Pastor Appreciation', front: 'Thank You', icon: '✝',
      messages: [
        ['religious','Thank you for your faithful service and for shepherding us with such care.'],
        ['heartfelt','Your teaching and kindness have made a real difference to many. Thank you.'],
        ['short','Thank you for all you do.'],
        ['short','With gratitude for your ministry.'],
        ['formal','With sincere appreciation for your dedicated service and leadership.'],
        ['inspirational','The quiet work you do shapes more lives than you will ever count.']
      ]
    },
    'church-anniversary': {
      label: 'Church Anniversary', front: 'Happy Anniversary', icon: '✝',
      messages: [
        ['religious','Celebrating God\'s faithfulness through every year of this church\'s life.'],
        ['heartfelt','Congratulations on years of fellowship, service and community.'],
        ['short','Happy church anniversary.'],
        ['short','Celebrating with you.'],
        ['formal','Warmest congratulations on this milestone anniversary.'],
        ['inspirational','Years of faithful service, and many more still to come.']
      ]
    },
    'new-year': {
      label: 'New Year', front: 'Happy New Year', icon: '✦',
      messages: [
        ['heartfelt','Wishing you a year of good health, real joy and quiet contentment.'],
        ['short','Happy New Year.'],
        ['short','Wishing you a wonderful year ahead.'],
        ['funny','New year, same you, slightly more optimistic. Happy New Year.'],
        ['formal','Best wishes for a prosperous and healthy New Year.'],
        ['religious','May God bless your year with peace, provision and joy.']
      ]
    },
    'eid-al-fitr': {
      label: 'Eid al-Fitr', front: 'Eid Mubarak', icon: '✧',
      messages: [
        ['religious','Eid Mubarak. May your fast be accepted and your home filled with blessing.'],
        ['heartfelt','Wishing you and your family a joyful and peaceful Eid al-Fitr.'],
        ['short','Eid Mubarak.'],
        ['short','Wishing you a blessed Eid.'],
        ['formal','Warmest wishes to you and your family on Eid al-Fitr.'],
        ['inspirational','May the discipline of the month carry its peace into the year.']
      ]
    },
    'eid-al-adha': {
      label: 'Eid al-Adha', front: 'Eid Mubarak', icon: '✧',
      messages: [
        ['religious','Eid Mubarak. May your sacrifice and prayers be accepted and richly blessed.'],
        ['heartfelt','Wishing you and your loved ones a peaceful and joyful Eid al-Adha.'],
        ['short','Eid Mubarak.'],
        ['short','Blessed Eid to you and your family.'],
        ['formal','Warmest wishes on the occasion of Eid al-Adha.'],
        ['inspirational','May the spirit of generosity in this festival stay with you all year.']
      ]
    },
    'ramadan': {
      label: 'Ramadan', front: 'Ramadan Mubarak', icon: '✧',
      messages: [
        ['religious','Ramadan Mubarak. May your fasting and prayers be accepted and blessed.'],
        ['heartfelt','Wishing you a peaceful, reflective and blessed month of Ramadan.'],
        ['short','Ramadan Mubarak.'],
        ['short','Wishing you a blessed Ramadan.'],
        ['formal','Warmest wishes for a blessed and peaceful Ramadan.'],
        ['inspirational','May this month bring stillness, clarity and a generous heart.']
      ]
    },
    'diwali': {
      label: 'Diwali', front: 'Happy Diwali', icon: '✦',
      messages: [
        ['heartfelt','Wishing you and your family a Diwali full of light, joy and prosperity.'],
        ['short','Happy Diwali.'],
        ['short','Wishing you a bright and joyful Diwali.'],
        ['formal','Warmest wishes to you and your family this Diwali.'],
        ['inspirational','May light overcome darkness in every corner of your year.'],
        ['religious','May this festival of lights bring blessing, peace and prosperity to your home.']
      ]
    },
    'hanukkah': {
      label: 'Hanukkah', front: 'Happy Hanukkah', icon: '✧',
      messages: [
        ['heartfelt','Wishing you eight nights of light, warmth and good company.'],
        ['short','Happy Hanukkah.'],
        ['short','Chag Sameach.'],
        ['formal','Warmest wishes to you and your family this Hanukkah.'],
        ['religious','May the lights of Hanukkah bring blessing and peace to your home.'],
        ['inspirational','A small light, faithfully kept, outlasts a long darkness.']
      ]
    },
    'lunar-new-year': {
      label: 'Lunar New Year', front: 'Happy Lunar New Year', icon: '✦',
      messages: [
        ['heartfelt','Wishing you and your family prosperity, health and happiness in the new year.'],
        ['short','Happy Lunar New Year.'],
        ['short','Wishing you good fortune and health.'],
        ['formal','Warmest wishes for prosperity and good health in the new year.'],
        ['inspirational','A new year, a fresh page and every reason for hope.'],
        ['religious','May the new year bring blessing, peace and abundance to your family.']
      ]
    },
    'vaisakhi': {
      label: 'Vaisakhi', front: 'Happy Vaisakhi', icon: '✦',
      messages: [
        ['heartfelt','Wishing you and your family a joyful and blessed Vaisakhi.'],
        ['short','Happy Vaisakhi.'],
        ['short','Vaisakhi greetings to you and yours.'],
        ['formal','Warmest wishes on the occasion of Vaisakhi.'],
        ['religious','May this Vaisakhi bring blessing, courage and gratitude to your home.'],
        ['inspirational','A season of harvest and renewal. May yours be plentiful.']
      ]
    },
    'leaving-farewell': {
      label: 'Leaving and Farewell', front: 'Farewell and Good Luck', icon: '✦',
      messages: [
        ['heartfelt','You will be genuinely missed. Wishing you every success in what comes next.'],
        ['heartfelt','Thank you for everything you brought here. It will not be forgotten.'],
        ['short','Farewell and good luck.'],
        ['short','You will be missed.'],
        ['funny','We would say we will manage without you, but that remains to be tested.'],
        ['formal','With sincere thanks for your contribution and best wishes for the future.']
      ]
    },
    'teacher-appreciation': {
      label: 'Teacher Appreciation', front: 'Thank You', icon: '★',
      messages: [
        ['heartfelt','Thank you for your patience, encouragement and belief. It made a real difference.'],
        ['heartfelt','Good teachers are remembered for life. You are one of them.'],
        ['short','Thank you for everything.'],
        ['short','With sincere thanks.'],
        ['formal','With sincere appreciation for your dedication and commitment.'],
        ['inspirational','You shape more futures than you will ever get to see. Thank you.']
      ]
    },
    'colleague-appreciation': {
      label: 'Colleague Appreciation', front: 'Thank You', icon: '★',
      messages: [
        ['heartfelt','Thank you for your support and steadiness. You make the work better.'],
        ['short','Thank you for everything.'],
        ['short','Really appreciate you.'],
        ['funny','Thank you for being the reason meetings are occasionally bearable.'],
        ['formal','With sincere appreciation for your professionalism and support.'],
        ['inspirational','The quiet reliability you bring is noticed more than you think.']
      ]
    },
    'boss-appreciation': {
      label: 'Boss Appreciation', front: 'Thank You', icon: '★',
      messages: [
        ['heartfelt','Thank you for your guidance and for backing the team when it mattered.'],
        ['short','Thank you for your support.'],
        ['short','With sincere appreciation.'],
        ['formal','With sincere thanks for your leadership and continued support.'],
        ['inspirational','Good leadership is felt long after the day ends. Thank you for yours.'],
        ['funny','Thank you for the guidance, the patience and the occasional coffee.']
      ]
    },
    'volunteer-appreciation': {
      label: 'Volunteer Appreciation', front: 'Thank You', icon: '♥',
      messages: [
        ['heartfelt','Thank you for giving your time so freely. It has made a real difference.'],
        ['heartfelt','Volunteers hold things together quietly. Thank you for being one of them.'],
        ['short','Thank you for all you do.'],
        ['short','With heartfelt thanks.'],
        ['formal','With sincere appreciation for your generous and valued contribution.'],
        ['religious','May God bless you for the kindness and service you give so freely.']
      ]
    }
  };

  const categories = [
    { id: 'celebrate', label: 'Celebrate', description: 'Cards for milestones, achievements and moments worth marking.', occasions: ['birthday', 'anniversary', 'congratulations', 'graduation', 'retirement', 'good-luck', 'exam-success', 'driving-test'] },
    { id: 'love-and-relationships', label: 'Love and relationships', description: 'Cards for love, commitment, friendship and putting things right.', occasions: ['wedding', 'engagement', 'valentine', 'friendship', 'sorry-apology', 'divorce-new-beginnings'] },
    { id: 'new-beginnings', label: 'New beginnings', description: 'Cards for new arrivals, new homes and new chapters.', occasions: ['new-baby', 'pregnancy', 'baby-shower', 'adoption', 'new-home', 'housewarming', 'new-job', 'job-promotion', 'starting-university', 'welcome-back'] },
    { id: 'support-and-care', label: 'Support and care', description: 'Cards for illness, loss and the times when words are hard to find.', occasions: ['get-well', 'thinking-of-you', 'sympathy', 'pet-loss', 'pregnancy-loss', 'serious-illness', 'encouragement', 'difficult-times'] },
    { id: 'family-and-faith', label: 'Family and faith', description: 'Cards for family celebrations and moments of faith.', occasions: ['mothers-day', 'fathers-day', 'child-naming', 'baptism', 'christening', 'first-communion', 'confirmation', 'pastor-appreciation', 'church-anniversary'] },
    { id: 'seasonal-and-cultural', label: 'Seasonal and cultural', description: 'Cards for festivals and celebrations through the year.', occasions: ['christmas', 'easter', 'new-year', 'eid-al-fitr', 'eid-al-adha', 'ramadan', 'diwali', 'hanukkah', 'lunar-new-year', 'vaisakhi'] },
    { id: 'work-and-appreciation', label: 'Work and appreciation', description: 'Cards for thanks, farewells and recognition at work.', occasions: ['thanks', 'leaving-farewell', 'teacher-appreciation', 'colleague-appreciation', 'boss-appreciation', 'volunteer-appreciation', 'new-job', 'job-promotion', 'retirement'] }
  ];

  const recipients = [
    'Mum','Dad','Husband','Wife','Partner','Son','Daughter','Sister','Brother',
    'Friend','Best friend','Colleague','Boss','Teacher','Customer','Couple','Child',
    'Grandmother','Grandfather','Neighbour','Church member','Someone special'
  ];

  const tones = [
    ['heartfelt','Heartfelt'],['short','Short and simple'],['funny','Funny'],
    ['formal','Formal'],['romantic','Romantic'],['religious','Religious'],
    ['inspirational','Inspirational'],['professional','Professional']
  ];

  function chooseMessages(occasion, tone, recipient, name, memory) {
    const data = occasions[occasion] || occasions.birthday;
    let pool = data.messages.filter(item => item[0] === tone);
    if (pool.length < 4) pool = [...pool, ...data.messages.filter(item => item[0] !== tone)];
    const selected = pool.slice(0, 6).map((item, index) => {
      let text = item[1];
      const who = name || recipient;
      if (who && index < 2) text = `${who}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
      if (memory && index === 0) text += ` I will always remember ${memory.trim().replace(/[.!?]+$/, '')}.`;
      return text;
    });
    return [...new Set(selected)].slice(0, 6);
  }

  window.CardMessageData = { occasions, categories, recipients, tones, chooseMessages };
})();
