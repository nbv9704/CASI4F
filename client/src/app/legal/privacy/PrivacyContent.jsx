'use client'

import { useLocale } from '@/context/LocaleContext'

const CONTENT = {
  en: {
    lastModifiedLabel: 'Date Last Modified',
    lastModified: 'November 4, 2025',
    hero: {
      eyebrow: 'Privacy Policy',
      title: 'Your data, your control',
      intro:
        'This Policy details the personal data we collect when you explore CASI4F, compete in rooms, or chat with support; the safeguards we rely on; and the choices available to you.',
    },
    sections: [
      {
        heading: '1. What does this Privacy Policy cover?',
        paragraphs: [
          'This Privacy Policy explains how CASI4F Entertainment Ltd. (“CASI4F”, “we”, “us”, or “our”) collects, uses, discloses, and protects personal data when you visit https://casi4f.com, use any companion applications, or interact with our services. We recognise that privacy is essential to our players and we are committed to providing transparency about our data practices.',
          'CASI4F processes personal data as a data controller under the General Data Protection Regulation (GDPR) and applicable Cypriot data protection laws. In some cases we also operate as a data processor on behalf of partners who supply white-label or co-branded experiences. Whenever this occurs we treat your personal data with the same level of care outlined in this document.',
          'By creating an account, submitting a form, or otherwise using the Platform, you confirm that you have read and understood this Policy.',
        ],
      },
      {
        heading: '2. Key definitions',
        paragraphs: [
          '“Personal data” means any information that identifies or can reasonably identify a natural person, such as a name, username, email address, IP address, or payment reference.',
          '“Services” means the CASI4F website, mobile applications, PvP rooms, solo games, leaderboards, promotional events, Help widget, and all other features controlled by CASI4F.',
          '“Processing” includes any operation performed on personal data, such as collecting, recording, organising, storing, retrieving, transmitting, or erasing.',
        ],
      },
      {
        heading: '3. Your privacy rights',
        paragraphs: [
          'As a data subject under the GDPR you have the right to access, rectify, or erase personal data we hold about you; to restrict or object to processing; to request data portability; and to lodge a complaint with your local supervisory authority.',
          'You may exercise these rights at any time by emailing privacy@casi4f.com or by submitting a request through our Help widget. For security-sensitive requests such as account deletion we may ask you to confirm the request from within your signed-in dashboard or via in-app chat so we can verify your identity.',
          'We respond to verified requests within one month. If a request is complex or numerous, we may extend this period by up to two additional months. We will inform you if an extension is necessary. Ordinarily, requests are handled free of charge.',
        ],
      },
      {
        heading: '4. Personal data we collect',
        paragraphs: [
          'Account data: username, email address, password hash, language preference, avatar, and optional profile details supplied during registration or profile updates.',
          'Gameplay data: room participation, wagers made using Credits, match history, leaderboard positions, reward redemptions, and device attributes generated while you interact with our Services.',
          'Transaction data: payment confirmations, masked card information, wallet identifiers, and billing correspondence required to process top-ups and detect fraud. We do not store full card numbers; those are handled by our payment providers.',
          'Technical data: IP address, browser type, operating system, device identifiers, referral URLs, session duration, crash reports, and diagnostic logs collected via cookies, SDKs, and server logs.',
          'Compliance data: identity documents, selfies, proof of address, and source-of-funds declarations provided during Know Your Customer (KYC) checks.',
          'Support data: messages sent via the Help widget, email communications, and additional context you share with our support team.',
        ],
      },
      {
        heading: '5. Legal bases for processing',
        paragraphs: [
          'We rely on different legal bases depending on the context of the processing:',
          '• Contractual necessity: to create your account, deliver games, credit purchases, reward participation, and provide core platform functionality.',
          '• Legitimate interests: to secure our platform, prevent fraud, analyse performance, develop new features, and personalise content while balancing your rights and expectations.',
          '• Consent: for optional marketing communications, non-essential cookies, and certain analytics or beta-testing programs. You may withdraw consent at any time.',
          '• Legal obligations: to satisfy tax, anti-money-laundering, regulatory, or judicial requirements, including responding to lawful requests from public authorities.',
        ],
      },
      {
        heading: '6. How we use personal data',
        paragraphs: [
          'To provide and maintain the Platform, including authenticating logins, delivering matchmaking, storing your inventory, and resolving technical issues.',
          'To process payments, issue invoices, and maintain transaction records for accounting and compliance purposes.',
          'To detect and prevent fraudulent or abusive activity by analysing gameplay signals, device fingerprints, and payment behaviour.',
          'To communicate with you about account changes, security alerts, policy updates, promotions you opt into, and service announcements.',
          'To facilitate customer support, including reproducing issues you report and improving Help content.',
          'To conduct analytics that help us understand feature performance and enhance user experience in aggregate form.',
        ],
      },
      {
        heading: '7. Sharing and disclosure',
        paragraphs: [
          'Service providers: we engage vetted vendors for hosting (AWS EU-central), payment processing, communications, analytics, anti-fraud, and customer support. These partners only process personal data under our instructions and subject to confidentiality obligations.',
          'Corporate events: if CASI4F is involved in a merger, acquisition, financing, or sale of assets, personal data may be transferred as part of that transaction, subject to the commitments in this Policy.',
          'Legal compliance: we may disclose data when required to comply with legal processes, enforce our Terms, address security risks, protect players, or cooperate with authorities. Where legally permissible we will notify you before disclosing your data.',
          'With your consent: if you request that we share data with another service or publish user-generated content, we will do so according to your instructions.',
        ],
      },
      {
        heading: '8. International transfers',
        paragraphs: [
          'Our primary infrastructure is located in Germany (eu-central-1). When we transfer personal data outside the European Economic Area, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses or adequacy decisions. Copies of relevant safeguards are available upon request.',
        ],
      },
      {
        heading: '9. Data retention',
        paragraphs: [
          'We retain personal data only for as long as necessary to fulfil the purposes outlined in this Policy. Factors we consider include the amount and sensitivity of the data, the potential risk of harm from unauthorised use, and any legal requirements that obligate retention.',
          'Gameplay and transaction records are typically stored for up to five years to comply with financial and anti-fraud obligations. Support conversations are kept for 24 months. Compliance documents obtained during KYC reviews are stored up to five years after account closure unless longer retention is mandated by law.',
          'When data is no longer required we securely delete it or anonymise it for analytical use.',
        ],
      },
      {
        heading: '10. Security measures',
        paragraphs: [
          'We implement technical and organisational measures designed to protect personal data, including encryption in transit and at rest, role-based access controls, security training for staff, logging, and vulnerability management. Access to personal data is limited to employees and contractors who need it to perform their work responsibilities.',
          'Despite our efforts, no online service can guarantee absolute security. You are responsible for safeguarding your password and for using trusted devices. Notify us immediately at security@casi4f.com if you suspect unauthorised access to your account.',
        ],
      },
      {
        heading: '11. Cookies and similar technologies',
        paragraphs: [
          'CASI4F uses strictly necessary cookies to keep you signed in and remember language preferences. We also use optional analytics and performance cookies to understand how players navigate the Platform. Where required by law we will request your consent before setting non-essential cookies. You can manage preferences via your browser settings or the in-product cookie banner.',
        ],
      },
      {
        heading: '12. Automated decision-making',
        paragraphs: [
          'We do not use personal data to make solely automated decisions that have legal or similarly significant effects on you. Certain features (such as fraud scoring) include automated components, but final decisions involve human review.',
        ],
      },
      {
        heading: '13. Third-party links',
        paragraphs: [
          'The Platform may contain links to external websites, partner offers, or community resources. Those services are not controlled by CASI4F and their privacy practices may differ. We encourage you to review the privacy policies of third-party sites before providing personal data.',
        ],
      },
      {
        heading: '14. Changes to this Policy',
        paragraphs: [
          'We may update this Privacy Policy to reflect legal, technical, or business developments. When we make material changes we will post the revised Policy on this page, adjust the modification date above, and, when appropriate, provide additional notice via email or in-product messaging.',
          'Your continued use of CASI4F after the effective date of an updated Policy constitutes acceptance of the changes. If you disagree with the revisions, please stop using the Services and request account closure.',
        ],
      },
      {
        heading: '15. Contact us',
        paragraphs: [
          'If you have questions about this Privacy Policy or wish to exercise your rights, contact our Data Protection Officer at privacy@casi4f.com. For security disclosures email security@casi4f.com. Postal correspondence can be sent to CASI4F Entertainment Ltd., 13 Kypranoros Street, Office 205, 1061 Nicosia, Cyprus.',
        ],
      },
    ],
  },
  vi: {
    lastModifiedLabel: 'Cập nhật lần cuối',
    lastModified: '4 tháng 11, 2025',
    hero: {
      eyebrow: 'Chính sách quyền riêng tư',
      title: 'Dữ liệu của bạn, quyền kiểm soát của bạn',
      intro:
        'Chính sách này mô tả dữ liệu cá nhân chúng tôi thu thập khi bạn khám phá CASI4F, tham gia phòng chơi hoặc trò chuyện với hỗ trợ; các biện pháp bảo vệ chúng tôi áp dụng và lựa chọn dành cho bạn.',
    },
    sections: [
      {
        heading: '1. Chính sách Quyền riêng tư này bao gồm những gì?',
        paragraphs: [
          'Chính sách Quyền riêng tư này giải thích cách CASI4F Entertainment Ltd. (“CASI4F”, “chúng tôi”) thu thập, sử dụng, công bố và bảo vệ dữ liệu cá nhân khi bạn truy cập https://casi4f.com, dùng ứng dụng liên quan hoặc tương tác với dịch vụ của chúng tôi. Chúng tôi hiểu quyền riêng tư rất quan trọng với người chơi và cam kết minh bạch về cách xử lý dữ liệu.',
          'CASI4F xử lý dữ liệu cá nhân với tư cách bên kiểm soát dữ liệu theo Quy định Bảo vệ Dữ liệu Chung (GDPR) và luật bảo vệ dữ liệu của Síp. Trong một số trường hợp, chúng tôi cũng hoạt động như bên xử lý dữ liệu thay mặt đối tác cung cấp trải nghiệm white-label hoặc đồng thương hiệu. Dù tình huống nào, chúng tôi vẫn bảo vệ dữ liệu với mức độ chăm sóc như nêu trong tài liệu này.',
          'Khi tạo tài khoản, gửi biểu mẫu hoặc sử dụng Nền tảng, bạn xác nhận đã đọc và hiểu Chính sách này.',
        ],
      },
      {
        heading: '2. Định nghĩa chính',
        paragraphs: [
          '“Dữ liệu cá nhân” là bất kỳ thông tin nào nhận dạng hoặc có thể nhận dạng một cá nhân, ví dụ: tên, tên người dùng, địa chỉ email, địa chỉ IP hoặc tham chiếu thanh toán.',
          '“Dịch vụ” bao gồm website CASI4F, ứng dụng di động, phòng PvP, trò chơi solo, bảng xếp hạng, sự kiện khuyến mãi, widget Trợ giúp và mọi tính năng do CASI4F điều hành.',
          '“Xử lý” gồm mọi thao tác với dữ liệu cá nhân như thu thập, ghi nhận, tổ chức, lưu trữ, truy xuất, truyền tải hoặc xoá.',
        ],
      },
      {
        heading: '3. Quyền riêng tư của bạn',
        paragraphs: [
          'Với tư cách chủ thể dữ liệu theo GDPR, bạn có quyền truy cập, chỉnh sửa hoặc xoá dữ liệu cá nhân chúng tôi lưu trữ; hạn chế hoặc phản đối xử lý; yêu cầu chuyển dữ liệu; và khiếu nại lên cơ quan quản lý tại địa phương.',
          'Bạn có thể thực hiện các quyền này bất cứ lúc nào bằng cách gửi email tới privacy@casi4f.com hoặc gửi yêu cầu qua widget Trợ giúp. Đối với các yêu cầu nhạy cảm như xoá tài khoản, chúng tôi có thể yêu cầu bạn xác nhận trong bảng điều khiển đã đăng nhập hoặc qua chat trong ứng dụng để xác minh danh tính.',
          'Chúng tôi phản hồi yêu cầu hợp lệ trong vòng một tháng. Nếu yêu cầu phức tạp hoặc số lượng lớn, thời hạn có thể gia hạn thêm tối đa hai tháng và chúng tôi sẽ thông báo. Thông thường chúng tôi xử lý miễn phí.',
        ],
      },
      {
        heading: '4. Dữ liệu cá nhân chúng tôi thu thập',
        paragraphs: [
          'Dữ liệu tài khoản: tên người dùng, địa chỉ email, hash mật khẩu, ngôn ngữ ưu tiên, avatar và thông tin hồ sơ tuỳ chọn bạn cung cấp khi đăng ký hoặc cập nhật.',
          'Dữ liệu chơi game: việc tham gia phòng, cược bằng Credit, lịch sử trận đấu, vị trí bảng xếp hạng, đổi thưởng và thuộc tính thiết bị phát sinh khi bạn tương tác với Dịch vụ.',
          'Dữ liệu giao dịch: xác nhận thanh toán, thông tin thẻ đã được che, định danh ví và thư tín cần thiết để xử lý nạp tiền, phát hiện gian lận. Chúng tôi không lưu số thẻ đầy đủ; thông tin này do nhà cung cấp thanh toán quản lý.',
          'Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt, hệ điều hành, định danh thiết bị, URL giới thiệu, thời lượng phiên, báo cáo lỗi và log chẩn đoán thu thập qua cookie, SDK và log máy chủ.',
          'Dữ liệu tuân thủ: giấy tờ định danh, ảnh selfie, bằng chứng địa chỉ và khai báo nguồn tiền cung cấp trong quá trình KYC.',
          'Dữ liệu hỗ trợ: tin nhắn gửi qua widget Trợ giúp, email và thông tin bổ sung bạn chia sẻ với đội hỗ trợ.',
        ],
      },
      {
        heading: '5. Cơ sở pháp lý cho việc xử lý',
        paragraphs: [
          'Chúng tôi dựa trên các cơ sở pháp lý khác nhau tuỳ theo ngữ cảnh xử lý:',
          '• Nhu cầu hợp đồng: tạo tài khoản, cung cấp trò chơi, xử lý mua Credit, tham gia nhận thưởng và đảm bảo chức năng cốt lõi của Nền tảng.',
          '• Lợi ích hợp pháp: bảo vệ nền tảng, ngăn gian lận, phân tích hiệu suất, phát triển tính năng mới và cá nhân hoá nội dung trong khi cân đối quyền lợi và kỳ vọng của bạn.',
          '• Sự đồng ý: cho email marketing tùy chọn, cookie không thiết yếu và một số chương trình phân tích hoặc thử nghiệm beta. Bạn có thể rút lại bất kỳ lúc nào.',
          '• Nghĩa vụ pháp lý: đáp ứng nghĩa vụ thuế, chống rửa tiền, quy định hoặc yêu cầu tư pháp, bao gồm phản hồi yêu cầu hợp pháp từ cơ quan chức năng.',
        ],
      },
      {
        heading: '6. Cách chúng tôi sử dụng dữ liệu cá nhân',
        paragraphs: [
          'Vận hành và duy trì Nền tảng, bao gồm xác thực đăng nhập, ghép trận, lưu trữ tài sản và xử lý sự cố kỹ thuật.',
          'Xử lý thanh toán, phát hành hoá đơn và lưu hồ sơ giao dịch phục vụ kế toán và tuân thủ.',
          'Phát hiện và ngăn chặn hoạt động gian lận hoặc lạm dụng bằng cách phân tích tín hiệu trò chơi, dấu vân tay thiết bị và hành vi thanh toán.',
          'Trao đổi với bạn về thay đổi tài khoản, cảnh báo bảo mật, cập nhật chính sách, khuyến mãi bạn tham gia và thông báo dịch vụ.',
          'Hỗ trợ khách hàng, tái tạo sự cố bạn báo và cải thiện nội dung Trợ giúp.',
          'Thực hiện phân tích để hiểu hiệu quả tính năng và nâng cao trải nghiệm người dùng dựa trên dữ liệu tổng hợp.',
        ],
      },
      {
        heading: '7. Chia sẻ và công bố',
        paragraphs: [
          'Nhà cung cấp dịch vụ: chúng tôi hợp tác với các đối tác được kiểm duyệt cho hạ tầng (AWS EU-central), xử lý thanh toán, truyền thông, phân tích, chống gian lận và hỗ trợ khách hàng. Các đối tác chỉ xử lý dữ liệu theo hướng dẫn của chúng tôi và phải tuân thủ cam kết bảo mật.',
          'Sự kiện doanh nghiệp: nếu CASI4F tham gia sáp nhập, mua bán, huy động vốn hoặc chuyển nhượng tài sản, dữ liệu cá nhân có thể được chuyển giao trong giao dịch đó, vẫn tuân thủ cam kết của Chính sách này.',
          'Tuân thủ pháp luật: chúng tôi có thể tiết lộ dữ liệu khi cần thiết để đáp ứng thủ tục pháp lý, thực thi Điều khoản, xử lý rủi ro bảo mật, bảo vệ người chơi hoặc hợp tác với cơ quan chức năng. Khi luật cho phép, chúng tôi sẽ thông báo trước cho bạn.',
          'Theo yêu cầu của bạn: nếu bạn đề nghị chúng tôi chia sẻ dữ liệu với dịch vụ khác hoặc công bố nội dung do bạn tạo, chúng tôi sẽ thực hiện theo chỉ dẫn của bạn.',
        ],
      },
      {
        heading: '8. Chuyển dữ liệu quốc tế',
        paragraphs: [
          'Hạ tầng chính của chúng tôi đặt tại Đức (eu-central-1). Khi chuyển dữ liệu cá nhân ra ngoài Khu vực Kinh tế châu Âu, chúng tôi đảm bảo áp dụng biện pháp bảo vệ phù hợp như Điều khoản Hợp đồng Tiêu chuẩn hoặc quyết định công nhận tương đương. Bạn có thể yêu cầu bản sao các biện pháp này.',
        ],
      },
      {
        heading: '9. Lưu trữ dữ liệu',
        paragraphs: [
          'Chúng tôi chỉ lưu trữ dữ liệu cá nhân trong thời gian cần thiết để hoàn thành mục đích nêu trong Chính sách. Các yếu tố xem xét gồm lượng và độ nhạy dữ liệu, rủi ro khi bị sử dụng trái phép và yêu cầu pháp lý bắt buộc.',
          'Hồ sơ chơi game và giao dịch thường được lưu tối đa năm năm nhằm đáp ứng nghĩa vụ tài chính và chống gian lận. Hội thoại hỗ trợ được lưu 24 tháng. Tài liệu KYC được giữ tối đa năm năm sau khi đóng tài khoản trừ khi luật yêu cầu lâu hơn.',
          'Khi dữ liệu không còn cần thiết, chúng tôi sẽ xoá an toàn hoặc ẩn danh để phục vụ phân tích.',
        ],
      },
      {
        heading: '10. Biện pháp bảo mật',
        paragraphs: [
          'Chúng tôi triển khai các biện pháp kỹ thuật và tổ chức để bảo vệ dữ liệu cá nhân, bao gồm mã hoá khi truyền và khi lưu trữ, kiểm soát truy cập theo vai trò, đào tạo bảo mật cho nhân sự, ghi log và quản lý lỗ hổng. Quyền truy cập dữ liệu cá nhân chỉ giới hạn cho nhân viên và đối tác cần thiết để thực hiện nhiệm vụ.',
          'Dù đã nỗ lực, không dịch vụ trực tuyến nào đảm bảo an toàn tuyệt đối. Bạn chịu trách nhiệm bảo vệ mật khẩu và sử dụng thiết bị đáng tin cậy. Hãy thông báo ngay cho security@casi4f.com nếu nghi ngờ tài khoản bị truy cập trái phép.',
        ],
      },
      {
        heading: '11. Cookies và công nghệ tương tự',
        paragraphs: [
          'CASI4F sử dụng cookie cần thiết để giữ phiên đăng nhập và ghi nhớ ngôn ngữ. Chúng tôi cũng dùng cookie phân tích và hiệu suất tuỳ chọn để hiểu cách người chơi điều hướng Nền tảng. Khi luật yêu cầu, chúng tôi sẽ xin sự đồng ý trước khi đặt cookie không thiết yếu. Bạn có thể quản lý trong trình duyệt hoặc banner cookie trong sản phẩm.',
        ],
      },
      {
        heading: '12. Quyết định tự động',
        paragraphs: [
          'Chúng tôi không sử dụng dữ liệu cá nhân để đưa ra quyết định hoàn toàn tự động có ảnh hưởng pháp lý hoặc tương tự đối với bạn. Một số tính năng (như chấm điểm gian lận) có thành phần tự động, nhưng quyết định cuối cùng luôn có sự xem xét của con người.',
        ],
      },
      {
        heading: '13. Liên kết bên thứ ba',
        paragraphs: [
          'Nền tảng có thể chứa liên kết tới website ngoài, ưu đãi đối tác hoặc tài nguyên cộng đồng. Các dịch vụ này không do CASI4F kiểm soát và có thể có chính sách quyền riêng tư khác. Bạn nên xem xét chính sách của bên thứ ba trước khi cung cấp dữ liệu cá nhân.',
        ],
      },
      {
        heading: '14. Thay đổi đối với Chính sách',
        paragraphs: [
          'Chúng tôi có thể cập nhật Chính sách Quyền riêng tư để phản ánh thay đổi pháp lý, kỹ thuật hoặc kinh doanh. Khi có điều chỉnh quan trọng, chúng tôi sẽ đăng phiên bản mới tại đây, cập nhật ngày hiệu lực và, khi phù hợp, gửi thông báo bổ sung qua email hoặc trong sản phẩm.',
          'Việc bạn tiếp tục sử dụng CASI4F sau ngày hiệu lực của Chính sách cập nhật đồng nghĩa chấp nhận thay đổi. Nếu không đồng ý, vui lòng ngừng sử dụng Dịch vụ và yêu cầu đóng tài khoản.',
        ],
      },
      {
        heading: '15. Liên hệ',
        paragraphs: [
          'Nếu bạn có câu hỏi về Chính sách này hoặc muốn thực hiện quyền của mình, hãy liên hệ Nhân viên Bảo vệ Dữ liệu qua privacy@casi4f.com. Với thông báo bảo mật, hãy gửi email security@casi4f.com. Thư tín gửi tới CASI4F Entertainment Ltd., 13 Kypranoros Street, Office 205, 1061 Nicosia, Cyprus.',
        ],
      },
    ],
  },
}

export default function PrivacyContent() {
  const { language } = useLocale()
  const content = CONTENT[language] ?? CONTENT.en

  return (
    <article className='relative isolate overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#11163a] via-[#0b102b] to-[#050711] text-slate-200 shadow-[0_32px_90px_rgba(6,8,20,0.55)]'>
      <div className='absolute -top-28 left-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl' aria-hidden='true' />
      <div className='absolute -bottom-28 right-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl' aria-hidden='true' />
      <div className='relative mx-auto flex w-full max-w-4xl flex-col gap-12 px-6 py-16 lg:px-12'>
        <header className='space-y-4 text-left'>
          <p className='text-xs font-semibold uppercase tracking-[0.35em] text-sky-200/80'>{content.hero.eyebrow}</p>
          <h1 className='text-3xl font-semibold text-white sm:text-4xl'>{content.hero.title}</h1>
          <p className='text-sm text-slate-300'>{`${content.lastModifiedLabel}: ${content.lastModified}`}</p>
          <p className='max-w-3xl text-base leading-relaxed text-slate-300/90'>{content.hero.intro}</p>
        </header>

        <div className='space-y-10 text-sm leading-relaxed text-slate-300/95'>
          {content.sections.map((section) => (
            <section key={section.heading} className='space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur'>
              <h2 className='text-lg font-semibold text-white'>{section.heading}</h2>
              <div className='space-y-3'>
                {section.paragraphs.map((paragraph, index) => (
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

