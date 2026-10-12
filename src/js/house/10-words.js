  /* ================= words ================= */
  var WORDS = [
    { id: 'house', word: 'house', ipa: '/haʊs/', pos: 'noun', zh: '房子', zone: 'out',
      def: 'A building where people live.', ex: 'We live in a big house.', exZh: '我们住在一座大房子里。',
      tip: 'house 是房子这座建筑；home 更像“家”。' },
    { id: 'door', word: 'door', ipa: '/dɔːr/', pos: 'noun', zh: '门', zone: 'both',
      def: 'You open it to go into or out of a house or a room.', ex: 'Please close the door.', exZh: '请把门关上。',
      tip: 'front door 前门；knock on the door 敲门。' },
    { id: 'tree', word: 'tree', ipa: '/triː/', pos: 'noun', zh: '树', zone: 'out',
      def: 'A tall plant with a thick trunk and many branches.', ex: 'A bird is sitting in the tree.', exZh: '一只鸟停在树上。',
      tip: '很多树在一起就是 forest（森林）。' },
    { id: 'mailbox', word: 'mailbox', ipa: '/ˈmeɪlbɑːks/', pos: 'noun', zh: '邮箱；信箱', zone: 'out',
      def: 'A box where letters are left for you.', ex: 'The letter is in the mailbox.', exZh: '信在信箱里。',
      tip: 'mail 邮件 + box 盒子。英式常说 postbox。' },
    { id: 'sofa', word: 'sofa', ipa: '/ˈsoʊfə/', pos: 'noun', zh: '沙发', zone: 'in',
      def: 'A long, soft seat for two or three people.', ex: 'My cat is sleeping on the sofa.', exZh: '我的猫在沙发上睡觉。',
      tip: '发音很像中文“沙发”。也可以说 couch。' },
    { id: 'cushion', word: 'cushion', ipa: '/ˈkʊʃən/', pos: 'noun', zh: '靠垫', zone: 'in',
      def: 'A soft bag you put on a sofa to lean on.', ex: 'She put a cushion behind her back.', exZh: '她在背后放了一个靠垫。',
      tip: 'cushion 是靠垫；pillow 是睡觉用的枕头。' },
    { id: 'coffeetable', word: 'coffee table', ipa: '/ˈkɔːfi ˌteɪbəl/', pos: 'noun', zh: '茶几', zone: 'in',
      def: 'A low table in a living room.', ex: 'The cups are on the coffee table.', exZh: '杯子在茶几上。',
      tip: '放杯子、书和遥控器的矮桌子。' },
    { id: 'rug', word: 'rug', ipa: '/rʌɡ/', pos: 'noun', zh: '小地毯', zone: 'in',
      def: 'A small carpet on the floor.', ex: 'The dog is lying on the rug.', exZh: '狗躺在地毯上。',
      tip: 'rug 是小块地毯；carpet 是铺满整个地面的。' },
    { id: 'tv', word: 'TV', ipa: '/ˌtiː ˈviː/', pos: 'noun', zh: '电视', zone: 'in',
      def: 'A machine with a screen that shows programs.', ex: 'Dad is watching TV.', exZh: '爸爸在看电视。',
      tip: 'TV 是 television 的缩写。' },
    { id: 'remote', word: 'remote control', ipa: '/rɪˌmoʊt kənˈtroʊl/', pos: 'noun', zh: '遥控器', zone: 'in',
      def: 'A small thing you use to control a TV from far away.', ex: 'Where is the remote control?', exZh: '遥控器在哪里？',
      tip: 'remote 远的 + control 控制 = 远距离控制。' },
    { id: 'floorlamp', word: 'floor lamp', ipa: '/ˈflɔːr ˌlæmp/', pos: 'noun', zh: '落地灯', zone: 'in',
      def: 'A tall light that stands on the floor.', ex: 'Turn on the floor lamp, please.', exZh: '请打开落地灯。',
      tip: 'floor 地板 + lamp 灯 = 落地灯。' },
    { id: 'bookshelf', word: 'bookshelf', ipa: '/ˈbʊkʃelf/', pos: 'noun', zh: '书架', zone: 'in',
      def: 'A piece of furniture with shelves for books.', ex: 'The bookshelf is full of storybooks.', exZh: '书架上摆满了故事书。',
      tip: 'book 书 + shelf 架子。复数是 bookshelves。' },
    { id: 'book', word: 'book', ipa: '/bʊk/', pos: 'noun', zh: '书', zone: 'in',
      def: 'Pages with words or pictures, fastened together.', ex: 'I read a book every night.', exZh: '我每天晚上读一本书。',
      tip: 'read a book 读书；open the book 打开书。' },
    { id: 'window', word: 'window', ipa: '/ˈwɪndoʊ/', pos: 'noun', zh: '窗户', zone: 'in',
      def: 'An opening in a wall with glass in it, so light comes in.', ex: 'Please open the window. It is hot.', exZh: '请打开窗户，好热。',
      tip: 'window 来自 wind（风）+ eye（眼睛）：风的眼睛。' },
    { id: 'curtain', word: 'curtain', ipa: '/ˈkɜːrtən/', pos: 'noun', zh: '窗帘', zone: 'in',
      def: 'A piece of cloth that hangs by a window.', ex: 'She closed the curtains at night.', exZh: '她晚上拉上了窗帘。',
      tip: '常用复数 curtains，因为通常是一对。' },
    { id: 'clock', word: 'clock', ipa: '/klɑːk/', pos: 'noun', zh: '钟；时钟', zone: 'in',
      def: 'It shows you what time it is.', ex: 'The clock says seven o’clock.', exZh: '钟显示七点整。',
      tip: 'o’clock 就是 of the clock（钟点）。' },
    { id: 'frame', word: 'picture frame', ipa: '/ˈpɪktʃər ˌfreɪm/', pos: 'noun', zh: '相框；画框', zone: 'in',
      def: 'A border around a picture or a photo.', ex: 'She put a photo in the picture frame.', exZh: '她把照片放进了相框。',
      tip: 'picture 图画 + frame 框。' },
    { id: 'plant', word: 'plant', ipa: '/plænt/', pos: 'noun', zh: '植物；盆栽', zone: 'in',
      def: 'A living thing that grows in soil, like a flower or a tree.', ex: 'Water the plant every day.', exZh: '每天给植物浇水。',
      tip: 'plant 也可以做动词：种植。' },
    { id: 'vase', word: 'vase', ipa: '/veɪs/', pos: 'noun', zh: '花瓶', zone: 'in',
      def: 'A container for flowers.', ex: 'She put some roses in a vase.', exZh: '她把几枝玫瑰插进花瓶里。',
      tip: '美式读 /veɪs/，英式常读 /vɑːz/。' },
    { id: 'cup', word: 'cup', ipa: '/kʌp/', pos: 'noun', zh: '杯子', zone: 'in',
      def: 'A small container with a handle, for tea or coffee.', ex: 'I would like a cup of tea.', exZh: '我想要一杯茶。',
      tip: 'a cup of tea 一杯茶。' },
    { id: 'aircon', word: 'air conditioner', ipa: '/ˈer kənˌdɪʃənər/', pos: 'noun', zh: '空调', zone: 'in',
      def: 'A machine that makes the air in a room cool.', ex: 'Turn on the air conditioner. It is hot.', exZh: '开空调吧，好热。',
      tip: '常缩写成 AC 或 A/C。' },
    { id: 'ceilinglight', word: 'ceiling light', ipa: '/ˈsiːlɪŋ ˌlaɪt/', pos: 'noun', zh: '吸顶灯', zone: 'in',
      def: 'A light that is fixed to the ceiling.', ex: 'The ceiling light is very bright.', exZh: '吸顶灯很亮。',
      tip: 'ceiling 天花板；floor 是地板，正好相反。' }
  ];
  /* ---- extra words: front yard, bedroom, study ---- */
  function W(id, word, ipa, zh, zone, def, ex, exZh, tip) { return { id: id, word: word, ipa: ipa, pos: 'noun', zh: zh, zone: zone, def: def, ex: ex, exZh: exZh, tip: tip }; }
  WORDS.push(
    W('pool', 'swimming pool', '/ˈswɪmɪŋ ˌpuːl/', '游泳池', 'out', 'A big hole filled with water, for swimming.', 'The children swim in the swimming pool.', '孩子们在游泳池里游泳。', 'swim 游泳 + ing；pool 就是水池。'),
    W('car', 'car', '/kɑːr/', '汽车', 'out', 'A vehicle with four wheels that takes people from place to place.', 'Dad drives the car to work.', '爸爸开车去上班。', 'drive a car 开车；by car 坐汽车。'),
    W('bicycle', 'bicycle', '/ˈbaɪsɪkəl/', '自行车', 'out', 'A vehicle with two wheels. You move the pedals with your feet.', 'I ride my bicycle to school.', '我骑自行车上学。', '常简称 bike。bi- 表示“二”，cycle 是“轮”。'),
    W('fence', 'fence', '/fens/', '栅栏；篱笆', 'out', 'A wall made of wood or metal around a garden.', 'The dog jumped over the fence.', '狗跳过了栅栏。', 'fence 围住花园，wall 是墙。'),
    W('flower', 'flower', '/ˈflaʊər/', '花', 'out', 'The colourful part of a plant.', 'She picked a red flower.', '她摘了一朵红花。', 'flower 和 flour（面粉）读音一样！'),
    W('ball', 'ball', '/bɔːl/', '球', 'out', 'A round thing that you throw, kick or hit in games.', 'He kicked the ball into the pool.', '他把球踢进了泳池。', 'kick a ball 踢球；throw a ball 扔球。'),
    W('bed', 'bed', '/bed/', '床', 'bed', 'A soft place where you sleep.', 'I go to bed at nine o’clock.', '我九点上床睡觉。', 'go to bed 上床睡觉。'),
    W('pillow', 'pillow', '/ˈpɪloʊ/', '枕头', 'bed', 'A soft cushion for your head in bed.', 'She put her head on the pillow.', '她把头靠在枕头上。', '睡觉用 pillow，沙发用 cushion。'),
    W('blanket', 'blanket', '/ˈblæŋkɪt/', '毯子', 'bed', 'A thick cover that keeps you warm in bed.', 'The baby is under a warm blanket.', '宝宝盖着暖和的毯子。', 'blanket 毯子；quilt 被子。'),
    W('wardrobe', 'wardrobe', '/ˈwɔːrdroʊb/', '衣柜', 'bed', 'A tall cupboard where you hang your clothes.', 'My clothes are in the wardrobe.', '我的衣服在衣柜里。', 'ward 保管 + robe 长袍 = 放衣服的柜子。'),
    W('nightstand', 'nightstand', '/ˈnaɪtstænd/', '床头柜', 'bed', 'A small table next to a bed.', 'The alarm clock is on the nightstand.', '闹钟在床头柜上。', 'night 夜晚 + stand 放东西的架子。英式 bedside table。'),
    W('alarmclock', 'alarm clock', '/əˈlɑːrm ˌklɑːk/', '闹钟', 'bed', 'A clock that rings to wake you up.', 'My alarm clock rings at seven.', '我的闹钟七点响。', 'alarm 警报 + clock 钟。'),
    W('teddy', 'teddy bear', '/ˈtedi ˌber/', '泰迪熊', 'bed', 'A soft toy bear.', 'She sleeps with her teddy bear.', '她抱着泰迪熊睡觉。', '名字来自美国总统 Teddy Roosevelt。'),
    W('mirror', 'mirror', '/ˈmɪrər/', '镜子', 'bed', 'Glass that shows you your face.', 'She looked in the mirror.', '她照了照镜子。', 'look in the mirror 照镜子。'),
    W('slippers', 'slippers', '/ˈslɪpərz/', '拖鞋', 'bed', 'Soft shoes you wear inside the house.', 'Put on your slippers.', '穿上你的拖鞋。', '拖鞋是一双，所以用复数 slippers。'),
    W('desk', 'desk', '/desk/', '书桌', 'study', 'A table where you read, write or work.', 'He does his homework at the desk.', '他在书桌前做作业。', 'desk 书桌；table 一般的桌子。'),
    W('chair', 'chair', '/tʃer/', '椅子', 'study', 'A seat for one person, with a back.', 'Please sit on the chair.', '请坐在椅子上。', 'take a chair = 坐下。'),
    W('laptop', 'laptop', '/ˈlæptɑːp/', '笔记本电脑', 'study', 'A small computer you can carry.', 'She works on her laptop.', '她在笔记本电脑上工作。', 'lap 大腿 + top 上面：放在腿上用的电脑。'),
    W('desklamp', 'desk lamp', '/ˈdesk ˌlæmp/', '台灯', 'study', 'A small light for a desk.', 'Turn on the desk lamp to read.', '打开台灯来读书。', 'desk 书桌 + lamp 灯。'),
    W('notebook', 'notebook', '/ˈnoʊtbʊk/', '笔记本', 'study', 'A book of empty pages for writing notes.', 'I write new words in my notebook.', '我把新单词写在笔记本里。', 'note 笔记 + book 本子。'),
    W('pencil', 'pencil', '/ˈpensəl/', '铅笔', 'study', 'A thin stick you write or draw with.', 'Can I borrow your pencil?', '我可以借你的铅笔吗？', 'pencil 铅笔；pen 钢笔、圆珠笔。'),
    W('globe', 'globe', '/ɡloʊb/', '地球仪', 'study', 'A ball with a map of the whole world on it.', 'Find China on the globe.', '在地球仪上找到中国。', 'globe 也指“地球”。'),
    W('backpack', 'backpack', '/ˈbækpæk/', '书包；背包', 'study', 'A bag you carry on your back.', 'My backpack is full of books.', '我的书包里装满了书。', 'back 背 + pack 包。也叫 schoolbag。')
  );
  /* ---- extra words: kitchen, back yard farm ---- */
  WORDS.push(
    W('fridge', 'refrigerator', '/rɪˈfrɪdʒəreɪtər/', '冰箱', 'kitchen', 'A big box that keeps food cold.', 'The milk is in the refrigerator.', '牛奶在冰箱里。', '口语常说 fridge。'),
    W('stove', 'stove', '/stoʊv/', '炉灶', 'kitchen', 'You cook food on top of it.', 'Mom is cooking soup on the stove.', '妈妈在炉子上煮汤。', 'on the stove 在炉子上。'),
    W('sink', 'sink', '/sɪŋk/', '水槽', 'kitchen', 'A basin with a tap, for washing dishes.', 'Wash the plates in the sink.', '在水槽里洗盘子。', 'sink 作动词是“下沉”。'),
    W('microwave', 'microwave', '/ˈmaɪkroʊweɪv/', '微波炉', 'kitchen', 'An oven that heats food very fast.', 'Heat the rice in the microwave.', '用微波炉热米饭。', 'micro 微小 + wave 波。'),
    W('pot', 'pot', '/pɑːt/', '锅', 'kitchen', 'A deep round container for cooking.', 'The soup is in the pot.', '汤在锅里。', 'pot 深锅；pan 平底锅。'),
    W('kettle', 'kettle', '/ˈketl/', '水壶', 'kitchen', 'A container for boiling water.', 'The kettle is boiling.', '水壶里的水开了。', 'boil the kettle 烧水。'),
    W('diningtable', 'dining table', '/ˈdaɪnɪŋ ˌteɪbəl/', '餐桌', 'kitchen', 'A table where a family eats meals.', 'We eat dinner at the dining table.', '我们在餐桌上吃晚饭。', 'dine 用餐，dining 就是“吃饭的”。'),
    W('plate', 'plate', '/pleɪt/', '盘子', 'kitchen', 'A flat dish you put food on.', 'Put the cake on the plate.', '把蛋糕放在盘子上。', 'plate 盘子；bowl 碗。'),
    W('bowl', 'bowl', '/boʊl/', '碗', 'kitchen', 'A round, deep dish for soup, rice or fruit.', 'There are apples in the bowl.', '碗里有苹果。', 'a bowl of rice 一碗米饭。'),
    W('cabinet', 'cabinet', '/ˈkæbɪnət/', '橱柜', 'kitchen', 'A cupboard where you keep dishes and food.', 'The cups are in the cabinet.', '杯子在橱柜里。', 'kitchen cabinet 厨房橱柜。'),
    W('barn', 'barn', '/bɑːrn/', '谷仓；牲口棚', 'back', 'A big farm building for animals and hay.', 'The cows sleep in the barn.', '奶牛睡在牲口棚里。', '农场里最大的红色房子。'),
    W('tractor', 'tractor', '/ˈtræktər/', '拖拉机', 'back', 'A strong farm machine for working in fields.', 'The farmer drives a tractor.', '农夫开着拖拉机。', 'tract 拉 → tractor 拉东西的机器。'),
    W('cow', 'cow', '/kaʊ/', '奶牛', 'back', 'A big farm animal that gives us milk.', 'The cow says moo.', '奶牛“哞哞”叫。', 'cow 母牛，叫声 moo。'),
    W('pig', 'pig', '/pɪɡ/', '猪', 'back', 'A pink farm animal with a curly tail.', 'The pig is playing in the mud.', '猪在泥里玩。', '叫声 oink。'),
    W('chicken', 'chicken', '/ˈtʃɪkɪn/', '鸡', 'back', 'A farm bird that lays eggs.', 'The chicken laid an egg.', '母鸡下了一个蛋。', '小鸡 chick，叫声 cluck。'),
    W('sheep', 'sheep', '/ʃiːp/', '绵羊', 'back', 'A farm animal with thick, soft wool.', 'The sheep eats grass.', '绵羊在吃草。', '单复数同形：one sheep, two sheep。'),
    W('scarecrow', 'scarecrow', '/ˈskerkroʊ/', '稻草人', 'back', 'A model of a person that keeps birds away from the crops.', 'The scarecrow stands in the field.', '稻草人站在田里。', 'scare 吓 + crow 乌鸦。'),
    W('hay', 'hay', '/heɪ/', '干草', 'back', 'Dry grass that farm animals eat.', 'The horse eats hay.', '马吃干草。', 'hay 和 hey 读音一样。'),
    W('carrot', 'carrot', '/ˈkærət/', '胡萝卜', 'back', 'An orange vegetable that grows in the ground.', 'Rabbits like carrots.', '兔子喜欢胡萝卜。', '长在土里，叶子露在外面。'),
    W('pond', 'pond', '/pɑːnd/', '池塘', 'back', 'A small area of water, smaller than a lake.', 'Ducks swim in the pond.', '鸭子在池塘里游。', 'pond 小；lake 湖更大。'),
    W('windmill', 'windmill', '/ˈwɪndmɪl/', '风车', 'back', 'A tall tower with big blades that the wind turns.', 'The windmill turns in the wind.', '风车在风中转动。', 'wind 风 + mill 磨坊。')
  );
  /* ---- extra words: hall, bathroom, kids room ---- */
  WORDS.push(
    W('stairs', 'stairs', '/sterz/', '楼梯', 'hall', 'Steps that take you up or down between floors.', 'Walk up the stairs to the bedroom.', '沿着楼梯走上去，就是卧室。', 'go upstairs 上楼；go downstairs 下楼。stairs 常用复数。'),
    W('handrail', 'handrail', '/ˈhændreɪl/', '扶手', 'hall', 'A bar you hold on to when you use the stairs.', 'Hold the handrail when you go down.', '下楼时请扶好扶手。', 'hand 手 + rail 栏杆 = 扶手。'),
    W('shoecabinet', 'shoe cabinet', '/ˈʃuː ˌkæbɪnət/', '鞋柜', 'hall', 'A cupboard for keeping shoes.', 'Put your shoes in the shoe cabinet.', '把你的鞋放进鞋柜。', 'shoe 鞋 + cabinet 柜子。'),
    W('umbrella', 'umbrella', '/ʌmˈbrelə/', '雨伞', 'hall', 'You hold it over your head when it rains.', 'Take an umbrella. It is raining.', '带把伞吧，在下雨。', '重音在第二个音节：um-BREL-la。'),
    W('coatrack', 'coat rack', '/ˈkoʊt ˌræk/', '衣帽架；挂衣钩', 'hall', 'A rack with hooks for hanging coats and hats.', 'Hang your coat on the coat rack.', '把外套挂在衣帽架上。', 'coat 外套 + rack 架子。'),
    W('toilet', 'toilet', '/ˈtɔɪlət/', '马桶', 'bath', 'You sit on it when you go to the bathroom.', 'Please flush the toilet.', '请冲一下马桶。', '也可以指“洗手间”；美式也说 bathroom。'),
    W('bathtub', 'bathtub', '/ˈbæθtʌb/', '浴缸', 'bath', 'A big container you fill with water to wash in.', 'The baby is in the bathtub.', '宝宝在浴缸里。', 'bath 洗澡 + tub 盆。'),
    W('shower', 'shower', '/ˈʃaʊər/', '淋浴', 'bath', 'Water falls from above to wash your body.', 'I take a shower every morning.', '我每天早上洗淋浴。', 'take a shower 洗淋浴。shower 也指“阵雨”。'),
    W('washbasin', 'washbasin', '/ˈwɑːʃˌbeɪsən/', '洗手池；洗脸盆', 'bath', 'A bowl with a tap for washing your hands and face.', 'Wash your hands at the washbasin.', '在洗手池洗手。', 'wash 洗 + basin 盆。也叫 sink。'),
    W('towel', 'towel', '/ˈtaʊəl/', '毛巾；浴巾', 'bath', 'A soft cloth that dries your body.', 'Dry your hands with a towel.', '用毛巾擦干手。', 'towel 和 tower（塔）读音相近。'),
    W('toothbrush', 'toothbrush', '/ˈtuːθbrʌʃ/', '牙刷', 'bath', 'A small brush for cleaning your teeth.', 'Brush your teeth with a toothbrush.', '用牙刷刷牙。', 'tooth 牙 + brush 刷子。'),
    W('soap', 'soap', '/soʊp/', '肥皂', 'bath', 'You use it with water to get clean.', 'Wash your hands with soap.', '用肥皂洗手。', 'soap 的 oa 读 /oʊ/，和 boat 一样。'),
    W('toybox', 'toy box', '/ˈtɔɪ ˌbɑːks/', '玩具箱', 'kids', 'A big box where you keep your toys.', 'Put the toys back in the toy box.', '把玩具放回玩具箱。', 'toy 玩具 + box 箱子。'),
    W('robot', 'robot', '/ˈroʊbɑːt/', '机器人', 'kids', 'A machine that can move and do work like a person.', 'The robot can walk and talk.', '这个机器人会走会说话。', 'robot 重音在前：RO-bot。'),
    W('blocks', 'building blocks', '/ˈbɪldɪŋ ˌblɑːks/', '积木', 'kids', 'Small blocks you stack up to build things.', 'He built a tower with building blocks.', '他用积木搭了一座塔。', 'build 建造 + ing；block 方块。'),
    W('toycar', 'toy car', '/ˈtɔɪ ˌkɑːr/', '玩具车', 'kids', 'A small car for children to play with.', 'The toy car goes very fast.', '这辆玩具车跑得很快。', 'toy 玩具 + car 汽车。'),
    W('doll', 'doll', '/dɑːl/', '洋娃娃', 'kids', 'A toy that looks like a small person.', 'She plays with her doll.', '她在玩她的洋娃娃。', 'doll 和 dull（无聊）不同，注意 o 的音。'),
    W('crayon', 'crayon', '/ˈkreɪɑːn/', '蜡笔', 'kids', 'A coloured stick you draw with.', 'I draw a sun with a yellow crayon.', '我用黄色蜡笔画太阳。', '读音 CRAY-on，不是 cray-yon。')
  );
  var BYID = {};
  WORDS.forEach(function (w) { BYID[w.id] = w; });

  /* ================= 单词释义本地化 =================
     上面的启动脚本按语言写入 data-words：每个词 [释义, 例句翻译, 小贴士]。
     zh / hant 有全部三项；ja / ko / th 有释义和例句翻译；en 为空表 —— 只显示英文释义。
     没有注入（本地直接打开模板）时保留内置中文。 */
  var LANG = $('app').getAttribute('data-lang') || 'zh';
  (function () {
    var raw = $('app').getAttribute('data-words'); if (raw == null) return;
    var LW = {}; try { LW = JSON.parse(raw) || {}; } catch (e) { return; }
    WORDS.forEach(function (w) { var l = LW[w.id] || []; w.zh = l[0] || ''; w.exZh = l[1] || ''; w.tip = l[2] || ''; });
  })();

  /* ================= emoji: 每个单词一个小图标（单词卡、标签、单词表、测验选项都用它） ================= */
  var EMO = {
    house: '🏠', door: '🚪', tree: '🌳', mailbox: '📫', pool: '🏊', car: '🚗', bicycle: '🚲', fence: '🚧', flower: '🌸', ball: '⚽',
    sofa: '🛋️', cushion: '🟥', coffeetable: '☕', rug: '🟫', tv: '📺', remote: '🎛️', floorlamp: '💡', bookshelf: '📚', book: '📕',
    window: '🪟', curtain: '🎭', clock: '🕰️', frame: '🖼️', plant: '🪴', vase: '🏺', cup: '🍵', aircon: '❄️', ceilinglight: '🔆',
    fridge: '🧊', stove: '🔥', sink: '🚰', microwave: '📟', pot: '🍲', kettle: '🫖', diningtable: '🍴', plate: '🍽️', bowl: '🥣', cabinet: '🗄️',
    stairs: '🪜', handrail: '🦯', shoecabinet: '👟', umbrella: '☂️', coatrack: '🧥',
    toilet: '🚽', bathtub: '🛁', shower: '🚿', washbasin: '🧼', towel: '🧣', toothbrush: '🪥', soap: '🧴',
    bed: '🛏️', pillow: '💤', blanket: '🧶', wardrobe: '👗', nightstand: '🗃️', alarmclock: '⏰', teddy: '🧸', mirror: '🪞', slippers: '🩴',
    desk: '🧑‍💻', chair: '🪑', laptop: '💻', desklamp: '🔦', notebook: '📓', pencil: '✏️', globe: '🌍', backpack: '🎒',
    toybox: '📦', robot: '🤖', blocks: '🧱', toycar: '🏎️', doll: '🪆', crayon: '🖍️',
    barn: '🛖', tractor: '🚜', cow: '🐄', pig: '🐷', chicken: '🐔', sheep: '🐑', scarecrow: '🎃', hay: '🌾', carrot: '🥕', pond: '🦆', windmill: '🌬️'
  };
  function emo(id) { return EMO[id] || '✨'; }

  /* ================= rooms ================= */
  /* [id, 国际化键, 兜底名, 贴纸 emoji, 贴纸底色] */
  var ZONES = [
    ['out', 'house.zone.out', 'Front yard · 前院', '🏡', '#9BE37A'],
    ['in', 'house.zone.living', 'Living room · 客厅', '🛋️', '#FFB86B'],
    ['kitchen', 'house.zone.kitchen', 'Kitchen · 厨房', '🍳', '#FFE066'],
    ['hall', 'house.zone.hall', 'Hall · 玄关楼梯', '🪜', '#D7B08A'],
    ['bath', 'house.zone.bath', 'Bathroom · 卫生间', '🛁', '#8EE0E6'],
    ['land', 'house.zone.landing', 'Upstairs · 二楼走廊', '🚪', '#E6C89E'],
    ['bed', 'house.zone.bed', 'Bedroom · 卧室', '🛏️', '#B7E4C7'],
    ['study', 'house.zone.study', 'Study · 书房', '📚', '#C9B8F2'],
    ['kids', 'house.zone.kids', 'Kids room · 儿童房', '🧸', '#9CD3FF'],
    ['back', 'house.zone.back', 'Farm · 后院农场', '🐮', '#FFC2D6']
  ];
  var ZBY = {}; ZONES.forEach(function (z) { ZBY[z[0]] = z; });
  function zoneName(z) { var r = ZBY[z]; return r ? T(r[1], r[2]) : T('house.zone.door', 'Door · 大门'); }
  function zoneShort(z) { var s = zoneName(z), i = s.lastIndexOf(' · '); return i >= 0 ? s.slice(i + 3) : s; }
  function wZone(w) { return w.zone === 'both' ? 'out' : w.zone; }
  function inHere(w) { return w.zone === zoneNow || (w.zone === 'both' && (zoneNow === 'out' || zoneNow === 'in')); }
  function zoneWords(z) { return WORDS.filter(function (w) { return wZone(w) === z; }); }

