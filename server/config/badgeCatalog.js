'use strict';

/**
 * Static badge catalog used to enrich profile payloads.
 * Badge metadata can be overridden or extended via MongoDB documents,
 * but these defaults ensure consistent UX even when the database lacks seed data.
 */
module.exports = [
  {
    code: 'THE_FLIPPER',
    name: 'The Flipper',
    description: 'Hoàn thành mốc Coinflip cao nhất để chứng tỏ bạn là bậc thầy tung đồng xu.',
    icon: '/badges/the-flipper.svg',
    tier: 'rare',
  },
  {
    code: 'LUCKY_STREAK',
    name: 'Lucky Streak',
    description: 'Giành chuỗi chiến thắng Coinflip dài nhất và giữ vững phong độ.',
    icon: '/badges/lucky-streak.svg',
    tier: 'epic',
  },
  {
    code: 'LOYAL_VISITOR',
    name: 'Loyal Visitor',
    description: 'Đăng nhập nhận thưởng hằng ngày đủ lâu để trở thành khách quen của CASI4F.',
    icon: '/badges/loyal-visitor.svg',
    tier: 'rare',
  },
  {
    code: 'TREASURE_HUNTER',
    name: 'Treasure Hunter',
    description: 'Không bỏ lỡ bất kỳ phần thưởng hằng ngày nào và gom hết quà tặng.',
    icon: '/badges/treasure-hunter.svg',
    tier: 'legendary',
  },
  {
    code: 'SOCIAL_STAR',
    name: 'Social Star',
    description: 'Kết bạn khắp nơi trong sảnh 4FUN và xây dựng mạng lưới riêng.',
    icon: '/badges/social-star.svg',
    tier: 'rare',
  },
  {
    code: 'LEVEL_5_BADGE',
    name: 'Level 5 Pioneer',
    description: 'Kỷ niệm cột mốc cấp 5 với tấm huy hiệu đầu tiên.',
    icon: '/badges/level5.png',
    tier: 'common',
  },
  {
    code: 'LEVEL_10_BADGE',
    name: 'Level 10 Vanguard',
    description: 'Đánh dấu hành trình lên cấp 10 với huy hiệu vanguard.',
    icon: '/badges/level10.png',
    tier: 'rare',
  },
  {
    code: 'LEVEL_20_BADGE',
    name: 'Level 20 Icon',
    description: 'Tôn vinh cấp 20 bằng huy hiệu thử nghiệm dành cho huyền thoại.',
    icon: '/badges/level20.png',
    tier: 'legendary',
  },
];
