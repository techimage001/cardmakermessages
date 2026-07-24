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
    }
  };

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

  window.CardMessageData = { occasions, recipients, tones, chooseMessages };
})();
