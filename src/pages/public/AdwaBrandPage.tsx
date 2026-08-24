import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHero } from '@/components/shared/PageHero'
import { AdwaSeal } from '@/components/shared/AdwaSeal'
import { CONTACT_INFO } from '@/constants'
import { Button } from '@/components/ui/button'

/** In-app mirror of /adwa.html — brand landing for “ADWA” searches. */
export default function AdwaBrandPage() {
  const { i18n } = useTranslation()
  const isHi = i18n.language === 'hi'

  return (
    <div className="bg-white">
      <PageHero
        title="ADWA"
        subtitle={
          isHi
            ? 'ऑल ड्राइवर्स वेलफेयर एसोसिएशन — आधिकारिक वेबसाइट'
            : 'All Drivers Welfare Association — official website'
        }
      />

      <section className="section-padding">
        <div className="container-wide max-w-3xl space-y-8">
          <div className="flex items-center gap-4">
            <AdwaSeal size="lg" />
            <div>
              <h2 className="text-xl font-extrabold text-neutral-900">
                {isHi ? 'ADWA क्या है?' : 'What is ADWA?'}
              </h2>
              <p className="text-sm text-neutral-500">
                alldriverswelfareassociation.org · Reg. {CONTACT_INFO.registryNumber}
              </p>
            </div>
          </div>

          <p className="text-neutral-700 leading-relaxed">
            {isHi ? (
              <>
                <strong>ADWA</strong> का मतलब है <strong>All Drivers Welfare Association</strong> —
                पेशेवर ड्राइवरों की आधिकारिक ड्राइवर्स एसोसिएशन। लोग हमें ADWA, adwa, alldrivers और
                drivers association नाम से भी खोजते हैं।
              </>
            ) : (
              <>
                <strong>ADWA</strong> means <strong>All Drivers Welfare Association</strong> — the
                official drivers association for professional drivers. People also search for us as{' '}
                <strong>adwa</strong>, <strong>alldrivers</strong>, and{' '}
                <strong>drivers association</strong>.
              </>
            )}
          </p>

          <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            {isHi ? (
              <>
                आधिकारिक साइट केवल{' '}
                <a className="font-bold underline" href="https://www.alldriverswelfareassociation.org/">
                  alldriverswelfareassociation.org
                </a>{' '}
                है (Drivers बहुवचन)। singular “driver” वाले domain से ADWA जुड़ा नहीं है।
              </>
            ) : (
              <>
                The only official ADWA site is{' '}
                <a className="font-bold underline" href="https://www.alldriverswelfareassociation.org/">
                  alldriverswelfareassociation.org
                </a>{' '}
                (plural <strong>Drivers</strong>). A lookalike domain with singular “driver” is not
                affiliated with ADWA.
              </>
            )}
          </aside>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/apply">{isHi ? 'आवेदन करें' : 'Apply for ADWA ID'}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/about">{isHi ? 'हमारे बारे में' : 'About'}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">{isHi ? 'संपर्क' : 'Contact'}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
