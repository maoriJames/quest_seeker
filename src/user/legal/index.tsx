import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import bg from '@/assets/images/background_main.png'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Section = {
  title: string
  content: React.ReactNode
}

const termsSections: Section[] = [
  {
    title: '1. Introduction and Acceptance',
    content: (
      <>
        These Terms of Use ("Terms") govern your access to and use of the
        QuestSeeker platform, including the QuestSeeker mobile application and
        any related services (collectively, the "Platform").
        <br />
        <br />
        QuestSeeker is operated by Tangata Whenua Network Limited ("we", "us",
        "our"), a company registered in New Zealand.
        <br />
        <br />
        By creating an account, accessing, or using the Platform, you agree to
        be bound by these Terms. If you do not agree to these Terms, you must
        not use the Platform.
        <br />
        <br />
        We reserve the right to update these Terms at any time. We will notify
        you of material changes via the app or by email. Your continued use of
        the Platform after any update constitutes acceptance of the revised
        Terms.
      </>
    ),
  },
  {
    title: '2. Eligibility',
    content: (
      <>
        To use QuestSeeker you must:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Be 18 years of age or older; or</li>
          <li>
            Be participating as part of a family group under the account and
            supervision of a parent or legal guardian who is 18 years or older.
          </li>
        </ul>
        <br />
        By using the Platform, you confirm that you meet these eligibility
        requirements. We reserve the right to suspend or terminate any account
        where eligibility requirements are not met.
      </>
    ),
  },
  {
    title: '3. Your Account',
    content: (
      <>
        To access most features of QuestSeeker you must register for an account.
        When creating an account, you agree to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Provide accurate, current, and complete information.</li>
          <li>Keep your account details up to date.</li>
          <li>
            Maintain the confidentiality of your password and not share access
            to your account with any other person.
          </li>
          <li>
            Notify us immediately if you become aware of any unauthorised use of
            your account.
          </li>
        </ul>
        <br />
        You are responsible for all activity that occurs under your account.
        Tangata Whenua Network Limited is not liable for any loss or damage
        arising from your failure to maintain the security of your account
        credentials.
      </>
    ),
  },
  {
    title: '4. Acceptable Use',
    content: (
      <>
        You agree to use QuestSeeker only for lawful purposes and in a manner
        that does not infringe the rights of others or restrict or inhibit
        anyone else's use and enjoyment of the Platform.
        <br />
        <br />
        You must not:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Submit false, misleading, or fraudulent Quest task evidence,
            including manipulated photos.
          </li>
          <li>
            Attempt to gain an unfair advantage on the leaderboard or in any
            Quest through cheating, exploiting bugs, or automated means.
          </li>
          <li>Harass, threaten, or harm other users or Quest Creators.</li>
          <li>
            Upload or transmit content that is offensive, defamatory, obscene,
            or in violation of any applicable law.
          </li>
          <li>
            Attempt to gain unauthorised access to any part of the Platform or
            another user's account.
          </li>
          <li>
            Use the Platform to send unsolicited commercial communications
            (spam).
          </li>
          <li>
            Reverse engineer, decompile, or otherwise attempt to extract the
            source code of the Platform.
          </li>
        </ul>
        <br />
        We reserve the right to remove any content that violates these Terms and
        to suspend or terminate accounts that engage in prohibited conduct.
      </>
    ),
  },
  {
    title: '5. Quest Seekers',
    content: (
      <>
        As a Quest Seeker, you may browse available Quests, pay any applicable
        entry fee or donation, and participate by completing Quest tasks within
        the specified timeframe.
        <br />
        <br />
        You acknowledge that:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Quest tasks may require you to visit physical locations. You are
            responsible for your own safety when participating in any Quest.
          </li>
          <li>
            You participate in Quests at your own risk. Tangata Whenua Network
            Limited is not responsible for any injury, loss, or damage arising
            from your participation in a Quest.
          </li>
          <li>
            Quests are time-bound events. Late submissions may not be accepted.
          </li>
          <li>
            Task submissions are subject to review and verification by Quest
            Creators and/or Tangata Whenua Network Limited.
          </li>
          <li>
            Decisions made by Quest Creators and Tangata Whenua Network Limited
            regarding task verification, scoring, and prize allocation are
            final.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Quest Creators — Responsibilities and Conduct',
    content: (
      <>
        Quest Creators design, publish, and manage Quests on the Platform. By
        creating a Quest, you agree to the following responsibilities:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Accurate information:</strong> All Quest details must be
            accurate and not misleading.
          </li>
          <li>
            <strong>Lawful Quests:</strong> Quests must not require participants
            to engage in any unlawful activity.
          </li>
          <li>
            <strong>Participant safety:</strong> Quest Creators must consider
            the safety of participants when designing tasks.
          </li>
          <li>
            <strong>Prize fulfilment:</strong> Where prizes are offered, Quest
            Creators are responsible for ensuring prizes are delivered to
            winners.
          </li>
          <li>
            <strong>Participant data:</strong> Quest Creators must handle
            participant data in accordance with the New Zealand Privacy Act
            2020.
          </li>
          <li>
            <strong>Compliance:</strong> Quest Creators using QuestSeeker for
            fundraising must comply with all applicable New Zealand laws.
          </li>
        </ul>
        <br />
        Tangata Whenua Network Limited reserves the right to remove any Quest
        that violates these Terms.
      </>
    ),
  },
  {
    title: '7. Entry Fees, Donations, and Payments',
    content: (
      <>
        Some Quests may require an entry fee or suggested donation to
        participate. Fees are set by Quest Creators and are displayed clearly
        before you join a Quest.
        <br />
        <br />
        All payments are processed securely through Stripe. By making a payment
        through QuestSeeker, you agree to Stripe's terms of service and privacy
        policy.
        <br />
        <br />
        <strong>Refund Policy:</strong> Entry fees are generally non-refundable
        once you have joined a Quest. However, if a Quest is cancelled by the
        Quest Creator before it begins, you are entitled to a full refund of any
        entry fee paid.
      </>
    ),
  },
  {
    title: '8. Prizes, Leaderboard, and Annual Competition',
    content: (
      <>
        QuestSeeker features an in-app leaderboard that tracks points earned by
        Quest Seekers across all Quests. Points are awarded for joining Quests,
        completing tasks, and finishing Quests.
        <br />
        <br />
        <strong>Annual leaderboard prizes:</strong> At the end of each year,
        special prizes are awarded to the highest-ranking Quest Seekers.
        Leaderboard scores are reset at the start of each new year.
        <br />
        <br />
        <strong>Fair play:</strong> Any attempt to manipulate the leaderboard
        through fraudulent submissions or automated tools will result in
        immediate disqualification and may result in account termination.
      </>
    ),
  },
  {
    title: '9. Intellectual Property',
    content: (
      <>
        <strong>Our content:</strong> The QuestSeeker name, logo, app design,
        and all content produced by Tangata Whenua Network Limited are our
        intellectual property. You must not reproduce or modify our content
        without prior written consent.
        <br />
        <br />
        <strong>Quest Creator content:</strong> Quest Creators retain ownership
        of their Quest content. By publishing a Quest, you grant Tangata Whenua
        Network Limited a non-exclusive, royalty-free licence to display your
        Quest content on the Platform.
        <br />
        <br />
        <strong>User submissions:</strong> You retain ownership of photos and
        content you submit as Quest task evidence. By submitting content, you
        grant us a limited licence to store and use it for Quest administration
        purposes.
      </>
    ),
  },
  {
    title: '10. Account Suspension and Termination',
    content: (
      <>
        Tangata Whenua Network Limited reserves the right to suspend or
        permanently terminate your account at any time if we reasonably believe
        that you have violated these Terms, engaged in fraudulent conduct, or
        acted in a way that poses a risk to other users.
        <br />
        <br />
        You may close your account at any time by contacting us. Closing your
        account does not entitle you to a refund of any fees already paid,
        except where required by law.
      </>
    ),
  },
  {
    title: '11. Disclaimers and Limitation of Liability',
    content: (
      <>
        The QuestSeeker Platform is provided on an "as is" and "as available"
        basis. To the fullest extent permitted by New Zealand law, Tangata
        Whenua Network Limited makes no warranties regarding the reliability or
        availability of the Platform.
        <br />
        <br />
        Tangata Whenua Network Limited is not liable for:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            Any loss or damage arising from your participation in a Quest,
            including personal injury.
          </li>
          <li>The conduct or actions of Quest Creators or other users.</li>
          <li>Prizes offered by Quest Creators that are not delivered.</li>
          <li>
            Any indirect, incidental, or consequential loss arising from your
            use of the Platform.
          </li>
        </ul>
        <br />
        Nothing in these Terms excludes any rights you may have under the New
        Zealand Consumer Guarantees Act 1993 or the Fair Trading Act 1986.
      </>
    ),
  },
  {
    title: '12. Privacy',
    content: (
      <>
        Your use of QuestSeeker is also governed by our Privacy Policy, which is
        incorporated into these Terms by reference. By using the Platform, you
        agree to the collection and use of your personal information as
        described in the Privacy Policy.
      </>
    ),
  },
  {
    title: '13. Governing Law',
    content: (
      <>
        These Terms are governed by and construed in accordance with the laws of
        New Zealand. Any dispute arising under or in connection with these Terms
        shall be subject to the exclusive jurisdiction of the New Zealand
        courts.
      </>
    ),
  },
  {
    title: '14. Contact Us',
    content: (
      <>
        If you have any questions about these Terms of Use, please contact us:
        <br />
        <br />
        <strong>Tangata Whenua Network Limited</strong>
        <br />
        Operating as: QuestSeeker
        <br />
        New Zealand
        <br />
        <strong>Email:</strong>{' '}
        <a
          href="mailto:support@questseeker.com"
          className="text-yellow-600 underline"
        >
          support@questseeker.com
        </a>
        <br />
        <br />
        <em>These Terms were last updated on 2 April 2026.</em>
      </>
    ),
  },
]

const privacySections: Section[] = [
  {
    title: '1. Who This Policy Applies To',
    content: (
      <>
        This policy applies to all users of the QuestSeeker platform, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Quest Seekers</strong> — individuals who browse, join, and
            participate in Quests.
          </li>
          <li>
            <strong>Quest Creators</strong> — organisations or individuals who
            create and manage Quests on the platform.
          </li>
        </ul>
        <br />
        QuestSeeker is intended for use by adults (18 years and over). We do not
        knowingly collect personal information from minors acting independently.
      </>
    ),
  },
  {
    title: '2. Information We Collect',
    content: (
      <>
        <strong>All users:</strong>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Full name and email address</li>
          <li>Password (stored in encrypted form)</li>
          <li>About Me content for your public profile</li>
          <li>Device information and usage analytics</li>
          <li>
            Location data and GPS coordinates (where permission is granted)
          </li>
          <li>Photos and media submitted as avatar or Quest task evidence</li>
        </ul>
        <br />
        <strong>Quest Creators only:</strong>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Business or organisation type and registered number</li>
          <li>Primary contact name and phone number</li>
          <li>Organisation description</li>
          <li>Payment information (processed via Stripe)</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. How We Use Your Information',
    content: (
      <>
        We use the personal information we collect to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Create and manage your QuestSeeker account</li>
          <li>Enable you to browse, join, and complete Quests</li>
          <li>Verify Quest task submissions</li>
          <li>Process entry fees and donations via Stripe</li>
          <li>Display leaderboards and award points and annual prizes</li>
          <li>Communicate with you about your account and Quests</li>
          <li>Improve platform performance through usage analytics</li>
          <li>Comply with our legal obligations under New Zealand law</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. Location Data',
    content: (
      <>
        QuestSeeker may request access to your device's location (GPS) to
        deliver location-based Quest challenges. Location data is only collected
        when you have granted permission through your device settings.
        <br />
        <br />
        You may withdraw location permission at any time. Withdrawing location
        permission may limit your ability to complete certain Quest tasks.
        <br />
        <br />
        We do not sell or share your location data with third parties for
        advertising or marketing purposes.
      </>
    ),
  },
  {
    title: '5. Sharing Your Information',
    content: (
      <>
        We do not sell your personal information. We may share your information
        in the following limited circumstances:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>
            <strong>Quest Creators:</strong> May see your name and participation
            details for Quests you join.
          </li>
          <li>
            <strong>Stripe:</strong> Payment information is processed by Stripe,
            a PCI DSS-compliant payment processor. We do not store your full
            card details.
          </li>
          <li>
            <strong>Analytics:</strong> We use analytics tools such as Google
            Analytics to understand platform usage. Data is anonymised where
            possible.
          </li>
          <li>
            <strong>Legal requirements:</strong> We may disclose your
            information if required by New Zealand law or a valid court order.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Photos and User-Generated Content',
    content: (
      <>
        Photos submitted as Quest task evidence are used solely for verifying
        Quest completion. Quest Creators may review submitted photos as part of
        the judging process.
        <br />
        <br />
        We do not use submitted photos for advertising or marketing without your
        explicit consent. You retain ownership of photos you submit.
      </>
    ),
  },
  {
    title: '7. Data Storage and Security',
    content: (
      <>
        Your personal information is stored on secure servers. We take
        reasonable steps to protect your information including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Encrypted storage of passwords</li>
          <li>Secure HTTPS connections for all data transmission</li>
          <li>Access controls limiting who can access personal data</li>
          <li>Use of PCI DSS-compliant third parties for payment processing</li>
        </ul>
        <br />
        No method of electronic storage is completely secure. If you become
        aware of any security concern relating to your account, please contact
        us immediately.
      </>
    ),
  },
  {
    title: '8. Data Retention',
    content: (
      <>
        We retain your personal information for as long as your account is
        active, or as long as necessary to provide our services and meet our
        legal obligations.
        <br />
        <br />
        If you close your account, we will delete or anonymise your personal
        information within a reasonable period, except where required by law to
        retain certain records.
      </>
    ),
  },
  {
    title: '9. Your Rights',
    content: (
      <>
        Under the New Zealand Privacy Act 2020, you have the right to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Request access to the personal information we hold about you</li>
          <li>
            Request correction of any inaccurate or incomplete information
          </li>
          <li>
            Withdraw consent for optional data uses such as location access or
            analytics
          </li>
          <li>Make a complaint if you believe we have breached your privacy</li>
        </ul>
        <br />
        To exercise any of these rights, please contact us using the details in
        Section 11.
      </>
    ),
  },
  {
    title: '10. Cookies and Analytics',
    content: (
      <>
        QuestSeeker and its web-based components may use cookies and similar
        tracking technologies to improve your experience and collect usage
        analytics. Analytics data is aggregated and anonymised where possible.
        <br />
        <br />
        You may be able to control cookie settings through your browser or
        device settings. Disabling cookies may affect the functionality of
        certain features.
      </>
    ),
  },
  {
    title: '11. Contact Us',
    content: (
      <>
        If you have any questions about this Privacy Policy or wish to make a
        privacy complaint, please contact us:
        <br />
        <br />
        <strong>Tangata Whenua Network Limited</strong>
        <br />
        Trading as: QuestSeeker
        <br />
        New Zealand
        <br />
        <strong>Email:</strong>{' '}
        <a
          href="mailto:support@questseeker.com"
          className="text-yellow-600 underline"
        >
          support@questseeker.com
        </a>
        <br />
        <br />
        If you are not satisfied with our response, you have the right to
        contact the Office of the Privacy Commissioner New Zealand at{' '}
        <a
          href="https://www.privacy.org.nz"
          target="_blank"
          rel="noreferrer"
          className="text-yellow-600 underline"
        >
          www.privacy.org.nz
        </a>
        .
      </>
    ),
  },
  {
    title: '12. Changes to This Policy',
    content: (
      <>
        We may update this Privacy Policy from time to time. When we make
        material changes, we will notify users via the app or by email.
        <br />
        <br />
        <em>This policy was last updated on 1 April 2026.</em>
      </>
    ),
  },
]

function AccordionSection({ sections }: { sections: Section[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <ul className="flex flex-col gap-2">
      {sections.map((section, index) => (
        <li
          key={index}
          className="border border-gray-200 rounded-xl overflow-hidden"
        >
          <button
            onClick={() => toggle(index)}
            className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/70 hover:bg-yellow-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-800">
              {section.title}
            </span>
            {openIndex === index ? (
              <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-5 py-4 bg-white/50 text-gray-700 text-sm border-t border-gray-100 leading-relaxed">
              {section.content}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Legal() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('tab') === 'privacy') {
      setActiveTab('privacy')
    }
  }, [searchParams])
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms')

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <Card className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl max-w-3xl w-full">
        <CardContent className="flex flex-col gap-4 p-6">
          <h1 className="text-2xl font-bold text-center">Legal</h1>

          {/* Tabs */}
          <div className="flex gap-2 justify-center mb-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={cn(
                'px-4 py-2 rounded transition-colors text-sm font-medium',
                activeTab === 'terms'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-200 text-gray-600 hover:bg-yellow-100',
              )}
            >
              Terms of Use
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={cn(
                'px-4 py-2 rounded transition-colors text-sm font-medium',
                activeTab === 'privacy'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-200 text-gray-600 hover:bg-yellow-100',
              )}
            >
              Privacy Policy
            </button>
          </div>

          {/* Effective date */}
          <p className="text-xs text-gray-500 text-center">
            {activeTab === 'terms'
              ? 'Effective date: 2 April 2026'
              : 'Effective date: 1 April 2026'}
          </p>

          {/* Content */}
          {activeTab === 'terms' ? (
            <AccordionSection sections={termsSections} />
          ) : (
            <AccordionSection sections={privacySections} />
          )}
          <a
            href="/user"
            className="inline-block mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-medium rounded transition-colors"
          >
            ← Back to Login
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
