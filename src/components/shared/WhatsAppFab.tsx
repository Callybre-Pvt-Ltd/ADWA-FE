import { motion } from "framer-motion";
import { SOCIAL_LINKS } from "@/constants";
import { WhatsAppLogo } from "@/components/shared/WhatsAppLogo";

export function WhatsAppFab() {
  return (
    <motion.a
      href={SOCIAL_LINKS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Help"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-2 rounded-full bg-green-600 px-5 py-3.5 text-base font-bold text-white shadow-lg hover:bg-green-700 transition-colors min-h-15"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <motion.span
          className="absolute inset-0 rounded-full bg-green-400"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <WhatsAppLogo className="relative h-7 w-7 text-white" />
      </span>
      <span>WhatsApp Help</span>
    </motion.a>
  );
}
