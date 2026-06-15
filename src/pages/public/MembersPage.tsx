import { useTranslation } from 'react-i18next'
import { Phone } from 'lucide-react'

interface Member {
  roleEn: string
  roleHi: string
  nameEn: string
  nameHi: string
  mobile?: string
}

const MEMBERS: Member[] = [
  {
    roleEn: 'Patron',
    roleHi: 'संरक्षक',
    nameEn: 'Prakash Kumar Singh',
    nameHi: 'प्रकाश कुमार सिंह',
  },
  {
    roleEn: 'State President',
    roleHi: 'प्रदेश अध्यक्ष',
    nameEn: 'Akhilesh Puri Goswami',
    nameHi: 'अखिलेश पुरी गोस्वामी',
    mobile: '9977282547',
  },
  {
    roleEn: 'Vice President',
    roleHi: 'उपाध्यक्ष',
    nameEn: 'Rajkumar Vishwakarma',
    nameHi: 'राजकुमार विश्वकर्मा',
    mobile: '9589074870',
  },
  {
    roleEn: 'General Secretary',
    roleHi: 'महासचिव',
    nameEn: 'Subhash Wakodey',
    nameHi: 'सुभाष वाकोड़े',
    mobile: '9977540136',
  },
  {
    roleEn: 'Joint Secretary',
    roleHi: 'संयुक्त सचिव',
    nameEn: 'Patiram Davre',
    nameHi: 'पतिराम दावरे',
    mobile: '8085072711',
  },
  {
    roleEn: 'Treasurer',
    roleHi: 'कोषाध्यक्ष',
    nameEn: 'Kanshiram Sen',
    nameHi: 'कांशीराम सेन',
    mobile: '9131534674',
  },
  {
    roleEn: 'Committee Advisor',
    roleHi: 'कमेटी सलाहकार',
    nameEn: 'Sukbhan Singh Yadav',
    nameHi: 'सुकभान सिंह यादव',
    mobile: '9131291915',
  },
  {
    roleEn: 'Spokesperson',
    roleHi: 'प्रवक्ता',
    nameEn: 'Abdul Razik',
    nameHi: 'अब्दुल राजिक',
    mobile: '9893542039',
  },
  {
    roleEn: 'Publicity Minister',
    roleHi: 'प्रचार मंत्री',
    nameEn: 'Vijay Kumar Yadav',
    nameHi: 'विजय कुमार यादव',
    mobile: '7089107154',
  },
  {
    roleEn: 'Media In-charge',
    roleHi: 'मीडिया प्रभारी',
    nameEn: 'Jitendra Meena',
    nameHi: 'जितेन्द्र मीणा',
    mobile: '7509777952',
  },
]

export default function MembersPage() {
  const { i18n } = useTranslation('nav')
  const isHi = i18n.language === 'hi'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* Hero */}
      <div className="bg-blue-900 text-white py-16 px-4 text-center">
        <p className="text-blue-300 text-sm font-semibold uppercase tracking-widest mb-3">
          {isHi ? 'ऑल ड्राईवर्स कल्याण संगठन, म.प्र.' : 'All Drivers Welfare Association, M.P.'}
        </p>
        <h1 className="text-3xl md:text-4xl font-black">
          {isHi ? 'हमारी टीम' : 'Our Members'}
        </h1>
        <p className="mt-3 text-blue-200 text-base max-w-xl mx-auto">
          {isHi
            ? 'संगठन के समर्पित पदाधिकारी जो ड्राइवरों के कल्याण के लिए कार्यरत हैं।'
            : 'Dedicated office-bearers working for the welfare of drivers across Madhya Pradesh.'}
        </p>
      </div>

      {/* Registration badge */}
      <div className="flex justify-center -mt-4">
        <span className="bg-amber-500 text-amber-950 text-xs font-bold px-5 py-1.5 rounded-full shadow-md">
          {isHi ? 'रजि. क्र. 01/01/01/43116/26' : 'Reg. No. 01/01/01/43116/26'}
        </span>
      </div>

      {/* Members grid */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MEMBERS.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-neutral-200 p-6 flex flex-col gap-2 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
            >
              {/* Role badge */}
              <span className="self-start text-xs font-bold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {isHi ? m.roleHi : m.roleEn}
              </span>

              {/* Name */}
              <div className="mt-1">
                <p className="text-lg font-black text-neutral-900 leading-snug">
                  {isHi ? m.nameHi : m.nameEn}
                </p>
                {/* Always show both scripts beneath */}
                <p className="text-sm text-neutral-400 mt-0.5">
                  {isHi ? m.nameEn : m.nameHi}
                </p>
              </div>

              {/* Mobile */}
              {m.mobile && (
                <a
                  href={`tel:${m.mobile}`}
                  className="mt-auto flex items-center gap-2 text-sm text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                >
                  <Phone size={14} />
                  {m.mobile}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Contact strip */}
        <div className="mt-14 bg-blue-900 text-white rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">
              {isHi ? 'कार्यालय संपर्क' : 'Office Contact'}
            </p>
            <p className="text-blue-200 text-sm mt-1">
              {isHi
                ? 'मकान नं. 08, भौरी, तह.–हुज़ूर, लिंजा–भोपाल – 462030'
                : 'House No. 08, Bhauri, Teh.–Huzur, Linja–Bhopal – 462030'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <a href="tel:9977282547" className="text-blue-200 hover:text-white font-semibold flex items-center gap-2">
              <Phone size={14} /> 9977282547
            </a>
            <a href="mailto:alldriverwelfareassociation.mp@gmail.com" className="text-blue-200 hover:text-white text-sm">
              alldriverwelfareassociation.mp@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
