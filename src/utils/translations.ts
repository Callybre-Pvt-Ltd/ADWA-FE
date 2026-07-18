export const districtMapEnToHi: Record<string, string> = {
  'Agar Malwa': 'आगर मालवा',
  'Alirajpur': 'अलीराजपुर',
  'Anuppur': 'अनूपपुर',
  'Ashoknagar': 'अशोकनगर',
  'Balaghat': 'बालाघाट',
  'Barwani': 'बड़वानी',
  'Betul': 'बैतूल',
  'Bhind': 'भिंड',
  'Bhopal': 'भोपाल',
  'Burhanpur': 'बुरहानपुर',
  'Chhatarpur': 'छतरपुर',
  'Chhindwara': 'छिंदवाड़ा',
  'Damoh': 'दमोह',
  'Datia': 'दतिया',
  'Dewas': 'देवास',
  'Dhar': 'धार',
  'Dindori': 'डिंडोरी',
  'Guna': 'गुना',
  'Gwalior': 'ग्वालियर',
  'Harda': 'हरदा',
  'Hoshangabad': 'होशंगाबाद',
  'Narmadapuram': 'नर्मदापुरम',
  'Indore': 'इंदौर',
  'Jabalpur': 'जबलपुर',
  'Jhabua': 'झाबुआ',
  'Katni': 'कटनी',
  'Khandwa': 'खंडवा',
  'Khargone': 'खरगोन',
  'Mandla': 'मंडला',
  'Mandsaur': 'मंदसौर',
  'Morena': 'मुरैना',
  'Narsinghpur': 'नरसिंहपुर',
  'Neemuch': 'नीमच',
  'Niwari': 'निवाड़ी',
  'Panna': 'पन्ना',
  'Raisen': 'रायसेन',
  'Rajgarh': 'राजगढ़',
  'Ratlam': 'रतलाम',
  'Rewa': 'रीवा',
  'Sagar': 'सागर',
  'Satna': 'सतना',
  'Sehore': 'सीहोर',
  'Seoni': 'सिवनी',
  'Shahdol': 'शहडोल',
  'Shajapur': 'शाजापुर',
  'Sheopur': 'श्योपुर',
  'Shivpuri': 'शिवपुरी',
  'Sidhi': 'सीधी',
  'Singrauli': 'सिंगरौली',
  'Tikamgarh': 'टीकमगढ़',
  'Ujjain': 'उज्जैन',
  'Umaria': 'उमरिया',
  'Vidisha': 'विदिशा',
  'Mumbai': 'मुंबई',
  'Delhi': 'दिल्ली',
  'Bengaluru Urban': 'बेंगलुरु शहरी',
  'Hyderabad': 'हैदराबाद',
  'Chennai': 'चेन्नई',
  'Kolkata': 'कोलकाता',
  'Pune': 'पुणे'
}

export const stateMapEnToHi: Record<string, string> = {
  'Maharashtra': 'महाराष्ट्र',
  'Delhi NCR': 'दिल्ली एनसीआर',
  'Karnataka': 'कर्नाटक',
  'Telangana': 'तेलंगाना',
  'Tamil Nadu': 'तमिलनाडु',
  'West Bengal': 'पश्चिम बंगाल',
  'Madhya Pradesh': 'मध्य प्रदेश',
}

export const nameTranslations: Record<string, string> = {
  'Arslaan Siddiqui': 'अर्शलान सिद्दीकी',
}

export const translateFullName = (name: string, isHi: boolean) => {
  if (!isHi) return name
  let translated = name.replace('District Incharge', 'जिला प्रभारी')
  for (const [en, hi] of Object.entries(districtMapEnToHi)) {
    translated = translated.replace(en, hi)
  }
  return translated
}
