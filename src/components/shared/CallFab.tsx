import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Phone } from "lucide-react";

export function CallFab() {
  const { t } = useTranslation('nav');
  return (
    <motion.a
      href="tel:+917319222335"
      aria-label={t('callHelp')}
      className="fixed bottom-6 left-4 md:left-6 z-50 flex items-center justify-center gap-2 rounded-full bg-orange-600 p-3.5 sm:px-5 sm:py-3.5 text-base font-bold text-white shadow-lg hover:bg-orange-700 transition-colors min-h-[48px] sm:min-h-[56px] w-[48px] h-[48px] sm:w-auto sm:h-auto"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
    >
      <span className="relative flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center shrink-0">
        <motion.span
          className="absolute inset-0 rounded-full bg-orange-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <Phone className="relative h-4.5 w-4.5 sm:h-5 sm:w-5 text-white" />
      </span>
      <span className="hidden sm:inline">{t('callHelp')}</span>
    </motion.a>
  );
}
