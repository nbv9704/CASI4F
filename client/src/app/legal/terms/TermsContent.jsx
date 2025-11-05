'use client'

import { useLocale } from '@/context/LocaleContext'

const CONTENT = {
  en: {
    lastUpdatedLabel: 'Date Last Modified',
    lastUpdated: 'November 4, 2025',
    hero: {
      eyebrow: 'Terms of Service',
      title: 'CASI4F User Agreement',
      intro:
        'Welcome to CASI4F. These Terms explain your rights and responsibilities when accessing our social casino platform, participating in PvP or solo games, unlocking rewards, or interacting with our community features. Please read them carefully before playing.',
    },
    sections: [
      {
        heading: '1. Definitions',
        body: [
          '“CASI4F”, “we”, “us”, or “our” refers to CASI4F Entertainment Ltd., the company that operates the CASI4F website, mobile applications, and related services.',
          '“Platform” means the CASI4F website located at https://casi4f.com as well as any companion apps, widgets, APIs, and communication channels we provide.',
          '“User”, “player”, “you”, or “your” means any natural person who has reached the age of majority in their place of residence, created an account, and accepted these Terms.',
          '“Credits” are non-redeemable virtual tokens that can be used to access games, rooms, and features within the Platform. Credits have no monetary value outside the Platform and may not be withdrawn, sold, or exchanged for real currency.',
          '“Games” includes PvP rooms, solo matches, seasonal events, mini-games, leaderboards, and any other interactive experiences that we make available inside CASI4F.',
          '“Provably Fair” refers to the cryptographic verification process CASI4F uses to demonstrate that game outcomes are random and tamper-resistant.',
        ],
      },
      {
        heading: '2. Scope of the Agreement',
        body: [
          'These Terms of Service form a binding agreement between you and CASI4F. They apply whenever you visit the Platform, create an account, take part in games, redeem rewards, or interact with any of our services. Additional terms (for example event rules or promotional conditions) may apply to specific features. In the event of a conflict, those specific terms supersede this document only for the activity to which they relate.',
          'By creating an account or using the Platform you confirm that you have read, understood, and agree to these Terms, as well as our Privacy Policy, Provably Fair overview, and any other policies referenced in this document.',
        ],
      },
      {
        heading: '3. Updates to the Terms',
        body: [
          'We may revise these Terms to reflect changes in our services, business, or regulatory obligations. When we do, we will update the “Date Last Modified” line at the top of this page and, when reasonable, provide notice through the Platform or by email. Continued use of CASI4F after an update constitutes acceptance of the revised Terms. If you do not agree with a change, you must stop using the Platform and request closure of your account.',
        ],
      },
      {
        heading: '4. Eligibility',
        body: [
          'You must be at least 18 years old (or the legal age of majority in your jurisdiction, if higher) to register for CASI4F. By opening or using an account, you warrant that you meet this requirement and that your use of the Platform is permitted under the laws of your place of residence. We may ask you to provide documents that verify your age, identity, or location, and we may suspend or terminate accounts that cannot be verified.',
          'The Platform is not available in jurisdictions where social casino or game-of-chance style products are prohibited. You are solely responsible for determining whether the laws in your jurisdiction allow you to use CASI4F. We reserve the right to block access from specific regions or countries at any time.',
        ],
      },
      {
        heading: '5. Account Registration and Security',
        body: [
          'Each individual may maintain only one CASI4F account. Accounts are personal and may not be transferred, sold, or shared with any third party. You are responsible for safeguarding your login credentials and for all activity that takes place under your account.',
          'If you suspect that your password or account has been compromised, contact us immediately at support@casi4f.com. We are not liable for losses or damages resulting from unauthorized access unless the incident was caused by our failure to implement reasonable security controls.',
          'We reserve the right to decline new registrations, suspend accounts, or restrict features where we detect suspicious behaviour, incomplete signup information, or violations of these Terms.',
        ],
      },
      {
        heading: '6. Virtual Credits and Rewards',
        body: [
          'Credits, bonus tickets, skins, coupons, and other rewards available on the Platform are digital items without cash value. They may solely be used inside CASI4F for entertainment purposes such as purchasing entries, unlocking rooms, or customizing your profile. You cannot redeem Credits for cash or transfer them to another service.',
          'The purchase of Credits constitutes a license to use those tokens within CASI4F. This license is non-transferable, revocable, and may be terminated if you breach these Terms. Transactions for Credits are considered final once the balance becomes available in your account. At our discretion we may provide refunds for obvious payment errors, but we are not obligated to refund spent Credits.',
          'We may modify, limit, or discontinue any Credits, promotions, reward programs, or in-game economies at any time. We will make reasonable efforts to communicate material changes in advance.',
        ],
      },
      {
        heading: '7. Fair Play and Acceptable Use',
        body: [
          'You agree to use CASI4F solely for legitimate, personal entertainment. The following activities are strictly prohibited: colluding with other players; creating multiple accounts; exploiting glitches or automation tools; attempting to reverse engineer the Platform; scraping or harvesting data; impersonating CASI4F staff; posting defamatory, hateful, or illegal content; or using VPNs, proxies, or spoofing technology to circumvent geo-blocks.',
          'We analyse platform activity to uphold game integrity. If we detect irregular play patterns, credit abuse, chargebacks, or fraudulent behaviour we may freeze balances, cancel results, remove rewards, and close your account. Serious incidents may be reported to relevant authorities.',
          'To preserve a safe community, we may moderate chats, forums, and in-game communication. We may remove content or mute accounts that violate our community standards.',
        ],
      },
      {
        heading: '8. Know Your Customer (KYC) and Compliance',
        body: [
          'We implement KYC, anti-money-laundering, and risk-control procedures aligned with applicable regulations. You may be asked to provide identity documents, proof of address, payment method confirmations, or source-of-funds information. Failure to cooperate with a compliance review may lead to suspension or termination of your account.',
          'You must only use payment methods that belong to you. Using third-party cards or wallets without authorization is prohibited and may be treated as fraud.',
        ],
      },
      {
        heading: '9. Intellectual Property',
        body: [
          'All trademarks, logos, artwork, interface designs, animations, and other content on CASI4F are owned by us or our licensors. You receive a limited, non-exclusive, non-transferable license to access the Platform for personal entertainment. Except where allowed by law, you may not copy, distribute, modify, translate, reverse engineer, or create derivative works based on CASI4F without our prior written permission.',
          'CASI4F is not affiliated with or endorsed by Valve Corporation, Counter-Strike, or any third-party game publisher. Any references to third-party marks are for descriptive purposes only.',
        ],
      },
      {
        heading: '10. Service Availability and Changes',
        body: [
          'We aim to keep CASI4F online around the clock, but we do not guarantee uninterrupted access. Maintenance, feature updates, technical issues, security incidents, or events beyond our control may cause outages or degraded performance. Where feasible we will communicate planned downtime in advance.',
          'We may modify or discontinue any portion of the Platform at any time. This includes adjusting matchmaking, reward formulas, progression systems, and user interface elements. Your continued use of the Platform after such changes indicates acceptance.',
        ],
      },
      {
        heading: '11. Limitation of Liability',
        body: [
          'CASI4F provides the Platform on an “as is” and “as available” basis. To the maximum extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that games will be error-free, uninterrupted, or meet your expectations.',
          'To the extent permitted by law, CASI4F, its directors, employees, partners, and suppliers will not be liable for any indirect, incidental, consequential, or punitive damages, or for loss of profits, revenue, goodwill, or data, arising out of or related to your use of the Platform. Our aggregate liability for direct damages will not exceed the total amount you have paid to CASI4F in the preceding six months.',
          'Nothing in these Terms limits liability that cannot be excluded by law, including liability for fraud, deceit, gross negligence, or death or personal injury caused by our negligence.',
        ],
      },
      {
        heading: '12. Suspension and Termination',
        body: [
          'We may suspend or terminate your account at any time if you breach these Terms, if we are required to do so by law, or if we discontinue the Platform. You may close your account at any time by contacting support@casi4f.com. Upon termination you must stop using the Platform and we may revoke access to any digital items or credits associated with your account.',
          'Sections of these Terms that by their nature should survive termination (including intellectual property, limitation of liability, indemnity, and dispute resolution provisions) will remain in effect.',
        ],
      },
      {
        heading: '13. Third-Party Services',
        body: [
          'CASI4F may link to or integrate with third-party services such as payment processors, analytics providers, or promotional partners. Those services are governed by their own terms and privacy policies. We are not responsible for the content or conduct of third parties, and your interactions with them are solely between you and the third party.',
        ],
      },
      {
        heading: '14. Dispute Resolution and Governing Law',
        body: [
          'These Terms are governed by the laws of the Republic of Cyprus, without regard to its conflict-of-law principles. Any dispute, claim, or controversy arising from or related to the Platform shall first be addressed by contacting support@casi4f.com so we can attempt to resolve the issue informally within 60 days.',
          'If a resolution cannot be reached, the dispute will be submitted to binding arbitration administered by the Cyprus Center for Alternative Dispute Resolution (A.D.R. Cyprus Center Ltd). The proceedings will take place online or in Nicosia, Cyprus, in English, before a single arbitrator. The arbitrator’s decision will be final and binding, and may be enforced in any court with jurisdiction.',
          'You and CASI4F agree that all claims must be brought in an individual capacity, and not as a plaintiff or class member in any purported class, collective, or representative action. You further waive any right to a jury trial to the extent that waiver is permitted by law.',
        ],
      },
      {
        heading: '15. Contact Information',
        body: [
          'For questions about these Terms, or to submit feedback or complaints, contact us at support@casi4f.com. For fairness concerns email fair@casi4f.com. We typically respond within three business days.',
        ],
      },
    ],
  },
  vi: {
    lastUpdatedLabel: 'Cập nhật lần cuối',
    lastUpdated: '4 tháng 11, 2025',
    hero: {
      eyebrow: 'Điều khoản dịch vụ',
      title: 'Thoả thuận người dùng CASI4F',
      intro:
        'Chào mừng bạn đến với CASI4F. Các Điều khoản này giải thích quyền và nghĩa vụ của bạn khi truy cập nền tảng casino xã hội, tham gia PvP hoặc solo, nhận thưởng hay tương tác cùng cộng đồng. Vui lòng đọc kỹ trước khi chơi.',
    },
    sections: [
      {
        heading: '1. Định nghĩa',
        body: [
          '“CASI4F”, “chúng tôi” hoặc “của chúng tôi” dùng để chỉ CASI4F Entertainment Ltd., công ty vận hành website CASI4F, ứng dụng di động và các dịch vụ liên quan.',
          '“Nền tảng” là website CASI4F tại https://casi4f.com cùng mọi ứng dụng, tiện ích, API và kênh giao tiếp mà chúng tôi cung cấp.',
          '“Người dùng”, “người chơi”, “bạn” hoặc “của bạn” là bất kỳ cá nhân đã đủ tuổi trưởng thành theo quy định tại nơi cư trú, tạo tài khoản và chấp nhận các Điều khoản này.',
          '“Credit” là token ảo không quy đổi dùng để truy cập trò chơi, phòng cược và các tính năng trên Nền tảng. Credit không có giá trị tiền tệ bên ngoài và không thể rút, bán hay đổi sang tiền thật.',
          '“Trò chơi” bao gồm phòng PvP, trận solo, sự kiện theo mùa, mini game, bảng xếp hạng và mọi trải nghiệm tương tác chúng tôi cung cấp bên trong CASI4F.',
          '“Chứng minh công bằng” mô tả quy trình xác thực bằng mật mã mà CASI4F sử dụng để chứng minh kết quả trò chơi là ngẫu nhiên và chống can thiệp.',
        ],
      },
      {
        heading: '2. Phạm vi thoả thuận',
        body: [
          'Các Điều khoản Dịch vụ này là thoả thuận ràng buộc giữa bạn và CASI4F. Chúng áp dụng bất cứ khi nào bạn truy cập Nền tảng, tạo tài khoản, tham gia trò chơi, nhận thưởng hoặc sử dụng bất kỳ dịch vụ nào của chúng tôi. Những điều khoản bổ sung (ví dụ: thể lệ sự kiện hoặc điều kiện khuyến mãi) có thể áp dụng cho tính năng cụ thể. Nếu xảy ra xung đột, điều khoản bổ sung đó sẽ ưu tiên cho hoạt động liên quan.',
          'Khi tạo tài khoản hoặc sử dụng Nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý với các Điều khoản này, cũng như Chính sách quyền riêng tư, hướng dẫn Chứng minh công bằng và các chính sách khác được dẫn chiếu.',
        ],
      },
      {
        heading: '3. Cập nhật Điều khoản',
        body: [
          'Chúng tôi có thể sửa đổi Điều khoản để phản ánh thay đổi dịch vụ, hoạt động kinh doanh hoặc yêu cầu pháp lý. Khi cập nhật, chúng tôi sẽ điều chỉnh dòng “Cập nhật lần cuối” ở đầu trang và, khi phù hợp, gửi thông báo qua Nền tảng hoặc email. Việc tiếp tục sử dụng CASI4F sau khi cập nhật đồng nghĩa bạn chấp nhận Điều khoản mới. Nếu không đồng ý, bạn phải ngừng sử dụng Nền tảng và yêu cầu đóng tài khoản.',
        ],
      },
      {
        heading: '4. Điều kiện sử dụng',
        body: [
          'Bạn phải đủ 18 tuổi (hoặc độ tuổi trưởng thành cao hơn theo luật địa phương) để đăng ký CASI4F. Khi mở hoặc sử dụng tài khoản, bạn cam kết đáp ứng yêu cầu này và việc sử dụng Nền tảng tuân thủ pháp luật nơi cư trú. Chúng tôi có thể yêu cầu bạn cung cấp giấy tờ xác minh độ tuổi, danh tính hoặc vị trí và có thể tạm khoá hoặc chấm dứt tài khoản không thể xác thực.',
          'Nền tảng không khả dụng tại các khu vực cấm casino xã hội hoặc sản phẩm mang tính may rủi. Bạn tự chịu trách nhiệm xác định pháp luật địa phương cho phép sử dụng CASI4F hay không. Chúng tôi có quyền chặn truy cập từ khu vực hoặc quốc gia cụ thể bất cứ lúc nào.',
        ],
      },
      {
        heading: '5. Đăng ký và bảo mật tài khoản',
        body: [
          'Mỗi cá nhân chỉ được sở hữu một tài khoản CASI4F. Tài khoản mang tính cá nhân và không được chuyển nhượng, mua bán hoặc chia sẻ cho bên thứ ba. Bạn chịu trách nhiệm bảo vệ thông tin đăng nhập và toàn bộ hoạt động diễn ra dưới tài khoản của mình.',
          'Nếu nghi ngờ mật khẩu hoặc tài khoản bị xâm phạm, hãy liên hệ ngay support@casi4f.com. Chúng tôi không chịu trách nhiệm cho thiệt hại phát sinh từ truy cập trái phép trừ khi sự cố bắt nguồn từ việc chúng tôi không áp dụng biện pháp bảo mật hợp lý.',
          'Chúng tôi có quyền từ chối đăng ký mới, tạm khoá tài khoản hoặc hạn chế tính năng khi phát hiện hành vi bất thường, thông tin đăng ký thiếu sót hoặc vi phạm Điều khoản.',
        ],
      },
      {
        heading: '6. Credit ảo và phần thưởng',
        body: [
          'Credit, vé thưởng, skin, coupon và phần thưởng khác trên Nền tảng là tài sản số không có giá trị đổi tiền. Chúng chỉ được dùng trong CASI4F cho mục đích giải trí như mua vé tham gia, mở phòng hoặc tuỳ chỉnh hồ sơ. Bạn không thể quy đổi Credit thành tiền mặt hay chuyển sang dịch vụ khác.',
          'Việc mua Credit đồng nghĩa bạn nhận giấy phép sử dụng token trong CASI4F. Giấy phép này không thể chuyển nhượng, có thể bị thu hồi và chấm dứt nếu bạn vi phạm Điều khoản. Giao dịch Credit được xem là hoàn tất ngay khi số dư xuất hiện trong tài khoản. Trong một số trường hợp rõ ràng, chúng tôi có thể hoàn tiền, nhưng không có nghĩa vụ hoàn Credit đã tiêu.',
          'Chúng tôi có thể thay đổi, giới hạn hoặc dừng bất kỳ chương trình Credit, khuyến mãi, phần thưởng hay nền kinh tế trong game nào bất cứ lúc nào. Chúng tôi sẽ cố gắng thông báo trước khi có thay đổi quan trọng.',
        ],
      },
      {
        heading: '7. Chơi công bằng và sử dụng hợp lý',
        body: [
          'Bạn đồng ý sử dụng CASI4F chỉ cho mục đích giải trí cá nhân hợp pháp. Các hành vi sau bị nghiêm cấm: thông đồng với người chơi khác; tạo nhiều tài khoản; lợi dụng lỗi hoặc công cụ tự động; cố gắng dịch ngược Nền tảng; thu thập dữ liệu trái phép; giả mạo nhân viên CASI4F; đăng nội dung phỉ báng, thù ghét hoặc bất hợp pháp; sử dụng VPN, proxy hoặc công nghệ giả mạo để vượt chặn địa lý.',
          'Chúng tôi phân tích hoạt động trên Nền tảng để đảm bảo tính toàn vẹn trò chơi. Nếu phát hiện hành vi bất thường, lạm dụng Credit, hoàn tiền giao dịch hoặc gian lận, chúng tôi có thể đóng băng số dư, huỷ kết quả, thu hồi phần thưởng và chấm dứt tài khoản. Trường hợp nghiêm trọng có thể được báo cho cơ quan chức năng.',
          'Để duy trì cộng đồng an toàn, chúng tôi có thể kiểm duyệt chat, diễn đàn và trao đổi trong game. Nội dung vi phạm tiêu chuẩn cộng đồng có thể bị xoá hoặc tài khoản liên quan bị tắt tiếng.',
        ],
      },
      {
        heading: '8. KYC và tuân thủ',
        body: [
          'Chúng tôi áp dụng quy trình KYC, chống rửa tiền và kiểm soát rủi ro theo quy định hiện hành. Bạn có thể được yêu cầu cung cấp giấy tờ tuỳ thân, bằng chứng địa chỉ, xác nhận phương thức thanh toán hoặc thông tin nguồn tiền. Không hợp tác trong quá trình kiểm tra có thể dẫn tới tạm ngưng hoặc chấm dứt tài khoản.',
          'Bạn chỉ được sử dụng phương thức thanh toán thuộc sở hữu của mình. Việc dùng thẻ hoặc ví của bên thứ ba khi chưa được cho phép bị cấm và có thể bị xem là gian lận.',
        ],
      },
      {
        heading: '9. Quyền sở hữu trí tuệ',
        body: [
          'Mọi nhãn hiệu, logo, đồ hoạ, thiết kế giao diện, hoạt ảnh và nội dung khác trên CASI4F thuộc sở hữu của chúng tôi hoặc đối tác cấp phép. Bạn nhận giấy phép giới hạn, không độc quyền, không chuyển nhượng để truy cập Nền tảng cho mục đích giải trí cá nhân. Trừ khi pháp luật cho phép, bạn không được sao chép, phân phối, chỉnh sửa, dịch thuật, dịch ngược hoặc tạo sản phẩm phái sinh từ CASI4F khi chưa có văn bản chấp thuận.',
          'CASI4F không liên kết hay được Valve Corporation, Counter-Strike hoặc bất kỳ nhà phát hành game nào bảo trợ. Mọi tham chiếu tới thương hiệu bên thứ ba chỉ nhằm mục đích mô tả.',
        ],
      },
      {
        heading: '10. Khả dụng dịch vụ và thay đổi',
        body: [
          'Chúng tôi nỗ lực duy trì CASI4F hoạt động liên tục, nhưng không bảo đảm truy cập không gián đoạn. Bảo trì, cập nhật tính năng, sự cố kỹ thuật, rủi ro bảo mật hoặc sự kiện ngoài tầm kiểm soát có thể gây gián đoạn. Khi có thể, chúng tôi sẽ thông báo lịch bảo trì trước.',
          'Chúng tôi có thể thay đổi hoặc ngừng bất kỳ phần nào của Nền tảng bất cứ lúc nào, bao gồm điều chỉnh ghép trận, công thức thưởng, hệ thống thăng tiến và giao diện. Việc bạn tiếp tục sử dụng Nền tảng sau thay đổi đồng nghĩa chấp nhận.',
        ],
      },
      {
        heading: '11. Giới hạn trách nhiệm',
        body: [
          'CASI4F cung cấp Nền tảng theo hiện trạng và tuỳ khả dụng. Trong phạm vi pháp luật cho phép, chúng tôi từ chối mọi bảo đảm ngụ ý, bao gồm khả năng thương mại, phù hợp mục đích cụ thể và không vi phạm. Chúng tôi không đảm bảo trò chơi không lỗi, không gián đoạn hay đáp ứng mọi kỳ vọng của bạn.',
          'Trong giới hạn pháp luật cho phép, CASI4F cùng giám đốc, nhân viên, đối tác và nhà cung cấp không chịu trách nhiệm cho thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hệ quả hoặc phạt; cũng như mất lợi nhuận, doanh thu, uy tín hoặc dữ liệu phát sinh từ việc bạn sử dụng Nền tảng. Tổng trách nhiệm trực tiếp của chúng tôi không vượt quá tổng số bạn đã trả cho CASI4F trong sáu tháng liền trước.',
          'Không điều khoản nào giới hạn trách nhiệm không thể loại trừ theo luật, bao gồm gian lận, lừa dối, sơ suất nghiêm trọng hoặc thiệt hại về tính mạng, sức khoẻ do lỗi của chúng tôi.',
        ],
      },
      {
        heading: '12. Đình chỉ và chấm dứt',
        body: [
          'Chúng tôi có thể đình chỉ hoặc chấm dứt tài khoản của bạn bất cứ lúc nào nếu vi phạm Điều khoản, bị yêu cầu bởi pháp luật hoặc khi ngừng Nền tảng. Bạn có thể đóng tài khoản bằng cách liên hệ support@casi4f.com. Khi chấm dứt, bạn phải ngừng sử dụng Nền tảng và chúng tôi có thể thu hồi quyền truy cập vào mọi vật phẩm số hoặc Credit liên quan tới tài khoản.',
          'Các điều khoản có tính chất duy trì hiệu lực sau khi chấm dứt (bao gồm quyền sở hữu trí tuệ, giới hạn trách nhiệm, bồi thường và giải quyết tranh chấp) vẫn tiếp tục áp dụng.',
        ],
      },
      {
        heading: '13. Dịch vụ bên thứ ba',
        body: [
          'CASI4F có thể liên kết hoặc tích hợp với dịch vụ bên thứ ba như cổng thanh toán, nhà phân tích hoặc đối tác khuyến mãi. Các dịch vụ đó chịu sự điều chỉnh bởi điều khoản và chính sách riêng. Chúng tôi không chịu trách nhiệm về nội dung hay hành vi của bên thứ ba và việc bạn tương tác hoàn toàn là giữa bạn và bên cung cấp.',
        ],
      },
      {
        heading: '14. Giải quyết tranh chấp và luật điều chỉnh',
        body: [
          'Các Điều khoản này chịu sự điều chỉnh của pháp luật Cộng hoà Síp, không xét tới xung đột pháp luật. Mọi tranh chấp, khiếu nại phát sinh từ Nền tảng cần được gửi tới support@casi4f.com để chúng tôi có 60 ngày xử lý phi chính thức trước.',
          'Nếu không thể giải quyết, tranh chấp sẽ được đưa ra trọng tài ràng buộc do Cyprus Center for Alternative Dispute Resolution (A.D.R. Cyprus Center Ltd) điều hành. Phiên họp diễn ra trực tuyến hoặc tại Nicosia, Síp, bằng tiếng Anh, với một trọng tài duy nhất. Quyết định của trọng tài là cuối cùng và có thể thi hành tại bất kỳ toà án có thẩm quyền.',
          'Bạn và CASI4F đồng ý chỉ được khởi kiện với tư cách cá nhân, không tham gia với vai trò nguyên đơn hoặc thành viên trong bất kỳ vụ kiện tập thể nào. Bạn cũng từ bỏ quyền xét xử bởi bồi thẩm đoàn trong phạm vi pháp luật cho phép.',
        ],
      },
      {
        heading: '15. Thông tin liên hệ',
        body: [
          'Nếu bạn có câu hỏi về Điều khoản này, hoặc muốn gửi góp ý, khiếu nại, hãy liên hệ support@casi4f.com. Với vấn đề công bằng, hãy email fair@casi4f.com. Chúng tôi thường phản hồi trong vòng ba ngày làm việc.',
        ],
      },
    ],
  },
}

export default function TermsContent() {
  const { language } = useLocale()
  const content = CONTENT[language] ?? CONTENT.en

  return (
    <article className='relative isolate overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#11163a] via-[#0c102d] to-[#050712] text-slate-200 shadow-[0_32px_90px_rgba(6,8,20,0.55)]'>
      <div className='absolute -top-24 left-24 h-60 w-60 rounded-full bg-fuchsia-500/20 blur-3xl' aria-hidden='true' />
      <div className='absolute -bottom-32 right-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl' aria-hidden='true' />
      <div className='relative mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-16 lg:px-12'>
        <header className='space-y-4 text-left'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-fuchsia-200/80'>{content.hero.eyebrow}</p>
          <h1 className='text-3xl font-semibold text-white sm:text-4xl'>{content.hero.title}</h1>
          <p className='text-sm text-slate-300'>{`${content.lastUpdatedLabel}: ${content.lastUpdated}`}</p>
          <p className='max-w-3xl text-base leading-relaxed text-slate-300/90'>{content.hero.intro}</p>
        </header>

        <div className='space-y-10 text-sm leading-relaxed text-slate-300/95'>
          {content.sections.map((section) => (
            <section key={section.heading} className='space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
              <h2 className='text-lg font-semibold text-white'>{section.heading}</h2>
              <div className='space-y-3'>
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  )
}
