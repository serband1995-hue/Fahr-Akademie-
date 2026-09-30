/* =====================================================================
   Verkehr verstehen · Spieler
   Spielt eine Szene (Format v1, siehe werkzeuge/szenen-export.js) in
   einem beliebigen Container ab: 3D-Bühne, Zeitleiste, Kapitel,
   Mitdenken OHNE Bewertung (E6 = a), Kamera, Tageszeit.
   Kostprobe: Liefert der Server nur das erste Kapitel (teaser), hält
   die Szene danach an und zeigt den Hinweis auf den Vollzugang.

   starte(el, daten, opt) -> { zerstoeren, zustand }
     opt.sprache      "de" | "tr" | "en" | "ar" | "es" | "ru" | "sr" | "ckb" | "kmr" | "hi" | "ur" | "vi" | "rif"
     opt.kopf         false = Titel/Kurztext nicht anzeigen
     opt.onVollzugang Knopf "Vollzugang anfragen" in der Kostprobe
   ===================================================================== */
import { erstelleWelt, baueLandstrasse } from "./motor.js";
import { baueKompassWelt, baueTeilnehmer } from "./stadt.js";

const UI = {
  de: { abspielen: "Abspielen", anhalten: "Anhalten", uebersicht: "Übersicht", schraeg: "Folgen", oben: "Oben", fahrer: "Fahrer", tag: "Tag", daemmerung: "Dämmerung", nacht: "Nacht",
    halb: "½ Tempo", vonVorn: "Von vorn", kamFolgt: "Kamera folgt der Erklärung", mitdenken: "Mitdenken: Szene hält bei Fragen an", md: "Mitdenken", aufl: "Auflösung zeigen", weiter: "Weiter",
    richtigIst: "Richtig ist", reihenfolge: "Die Reihenfolge", kein3d: "Dein Gerät kann die 3D-Darstellung leider nicht anzeigen. Die Erklärungen findest du unten.",
    worum: "Worum geht's?", merken: "Die Regel zum Merken", rf: "Richtig und falsch", zeit: "Zeitleiste", kapitel: "Kapitel", blick: "Blickwinkel", tageszeit: "Tageszeit wechseln", fassung: "Fassung",
    teaserTitel: "Weiter geht's mit dem Vollzugang", teaserText: "Das war die Kostprobe. Mit dem Vollzugang siehst du die ganze Szene mit allen Kapiteln und Fragen:", teaserKnopf: "Zugang anfragen", nochmal: "Kostprobe nochmal", gesperrt: "Mit Vollzugang", buehne: "Animierte 3D-Szene",
    kapZurueck: "Zurück", kapWeiter: "Weiter", alleKap: "Alle Kapitel", ende: "Ende der Szene", aufbau: "Szene wird aufgebaut …", zurFrage: "Zur Frage", schliessen: "Schließen" },
  en: { abspielen: "Play", anhalten: "Pause", uebersicht: "Overview", schraeg: "Follow", oben: "Top", fahrer: "Driver", tag: "Day", daemmerung: "Dusk", nacht: "Night",
    halb: "½ speed", vonVorn: "Restart", kamFolgt: "Camera follows the explanation", mitdenken: "Think along: scene pauses at questions", md: "Think along", aufl: "Show answer", weiter: "Continue",
    richtigIst: "Correct is", reihenfolge: "The order", kein3d: "Your device cannot show the 3D view. You'll find the explanations below.",
    worum: "What is it about?", merken: "Rules to remember", rf: "Right and wrong", zeit: "Timeline", kapitel: "Chapters", blick: "View", tageszeit: "Change time of day", fassung: "Version",
    teaserTitel: "Continue with full access", teaserText: "That was the preview. With full access you get the whole scene with all chapters and questions:", teaserKnopf: "Request access", nochmal: "Preview again", gesperrt: "Full access", buehne: "Animated 3D scene",
    kapZurueck: "Back", kapWeiter: "Next", alleKap: "All chapters", ende: "End of scene", aufbau: "Building the scene …", zurFrage: "To the question", schliessen: "Close" },
  tr: { abspielen: "Oynat", anhalten: "Durdur", uebersicht: "Genel bakış", schraeg: "Takip", oben: "Üstten", fahrer: "Sürücü", tag: "Gündüz", daemmerung: "Alacakaranlık", nacht: "Gece",
    halb: "½ hız", vonVorn: "Baştan", kamFolgt: "Kamera açıklamayı takip eder", mitdenken: "Birlikte düşün: sahne sorularda durur", md: "Birlikte düşün", aufl: "Cevabı göster", weiter: "Devam",
    richtigIst: "Doğru cevap", reihenfolge: "Sıralama", kein3d: "Cihazın 3D görünümü gösteremiyor. Açıklamaları aşağıda bulabilirsin.",
    worum: "Konu ne?", merken: "Akılda tutulacak kurallar", rf: "Doğru ve yanlış", zeit: "Zaman çizelgesi", kapitel: "Bölümler", blick: "Bakış açısı", tageszeit: "Günün saatini değiştir", fassung: "Sürüm",
    teaserTitel: "Tam erişimle devam et", teaserText: "Bu bir tadımlıktı. Tam erişimle sahnenin tamamını tüm bölümler ve sorularla görürsün:", teaserKnopf: "Erişim iste", nochmal: "Tadımlığı tekrar izle", gesperrt: "Tam erişim", buehne: "Hareketli 3D sahne",
    kapZurueck: "Geri", kapWeiter: "İleri", alleKap: "Tüm bölümler", ende: "Sahnenin sonu", aufbau: "Sahne hazırlanıyor …", zurFrage: "Soruya git", schliessen: "Kapat" },
  ar: { abspielen: "تشغيل", anhalten: "إيقاف مؤقت", uebersicht: "نظرة عامة", schraeg: "متابعة", oben: "من الأعلى", fahrer: "السائق", tag: "نهار", daemmerung: "غسق", nacht: "ليل",
    halb: "½ السرعة", vonVorn: "من البداية", kamFolgt: "الكاميرا تتبع الشرح", mitdenken: "فكّر معنا: يتوقف المشهد عند الأسئلة", md: "فكّر معنا", aufl: "أظهر الإجابة", weiter: "متابعة",
    richtigIst: "الإجابة الصحيحة", reihenfolge: "الترتيب", kein3d: "جهازك لا يستطيع عرض المشهد ثلاثي الأبعاد. تجد الشرح في الأسفل.",
    worum: "عمّ يدور الأمر؟", merken: "قواعد للحفظ", rf: "الصحيح والخطأ", zeit: "الخط الزمني", kapitel: "الفصول", blick: "زاوية الرؤية", tageszeit: "تغيير وقت اليوم", fassung: "النسخة",
    teaserTitel: "تابع مع الوصول الكامل", teaserText: "كان هذا عرضًا تجريبيًا. مع الوصول الكامل ترى المشهد كاملًا بكل الفصول والأسئلة:", teaserKnopf: "اطلب الوصول", nochmal: "شاهد العرض مرة أخرى", gesperrt: "وصول كامل", buehne: "مشهد متحرك ثلاثي الأبعاد",
    kapZurueck: "رجوع", kapWeiter: "التالي", alleKap: "كل الفصول", ende: "نهاية المشهد", aufbau: "جارٍ تجهيز المشهد …", zurFrage: "إلى السؤال", schliessen: "إغلاق" },
  es: {"abspielen":"Reproducir","anhalten":"Pausa","uebersicht":"Vista general","schraeg":"Seguir","oben":"Arriba","fahrer":"Conductor","tag":"Día","daemmerung":"Anochecer","nacht":"Noche","halb":"½ velocidad","vonVorn":"Desde el inicio","kamFolgt":"La cámara sigue la explicación","mitdenken":"Piensa conmigo: la escena se detiene en las preguntas","md":"Piensa conmigo","aufl":"Ver solución","weiter":"Seguir","richtigIst":"Lo correcto es","reihenfolge":"El orden","kein3d":"Tu dispositivo no puede mostrar la vista 3D. Encontrarás las explicaciones abajo.","worum":"¿De qué se trata?","merken":"La regla para recordar","rf":"Correcto e incorrecto","zeit":"Línea de tiempo","kapitel":"Capítulos","blick":"Punto de vista","tageszeit":"Cambiar hora del día","fassung":"Versión","teaserTitel":"Continúa con el acceso completo","teaserText":"Esa era la muestra. Con el acceso completo ves la escena entera con todos los capítulos y preguntas:","teaserKnopf":"Solicitar acceso","nochmal":"Ver muestra otra vez","gesperrt":"Con acceso completo","buehne":"Escena 3D animada","kapZurueck":"Atrás","kapWeiter":"Siguiente","alleKap":"Todos los capítulos","ende":"Fin de la escena","aufbau":"Preparando la escena …","zurFrage":"Ir a la pregunta","schliessen":"Cerrar"}
};
// === SPRACHPAKETE-ANFANG (01.10.2026): ru, sr, ckb, kmr, hi, ur, vi, rif
UI.ru = {"abspielen":"Воспроизвести","anhalten":"Пауза","uebersicht":"Обзор","schraeg":"Следовать","oben":"Сверху","fahrer":"Водитель","tag":"День","daemmerung":"Сумерки","nacht":"Ночь","halb":"½ скорости","vonVorn":"Сначала","kamFolgt":"Камера следует за объяснением","mitdenken":"Думай сам: сцена останавливается на вопросах","md":"Думай сам","aufl":"Показать ответ","weiter":"Дальше","richtigIst":"Правильно так","reihenfolge":"Очерёдность","kein3d":"К сожалению, твоё устройство не может показать 3D-изображение. Объяснения ты найдёшь ниже.","worum":"О чём речь?","merken":"Правило, которое нужно запомнить","rf":"Правильно и неправильно","zeit":"Шкала времени","kapitel":"Главы","blick":"Угол обзора","tageszeit":"Сменить время суток","fassung":"Версия","teaserTitel":"Продолжение — с полным доступом","teaserText":"Это был пробный фрагмент. С полным доступом ты увидишь всю сцену со всеми главами и вопросами:","teaserKnopf":"Запросить доступ","nochmal":"Пробный фрагмент ещё раз","gesperrt":"С полным доступом","buehne":"Анимированная 3D-сцена","kapZurueck":"Назад","kapWeiter":"Дальше","alleKap":"Все главы","ende":"Конец сцены","aufbau":"Сцена строится…","zurFrage":"К вопросу","schliessen":"Закрыть"};
UI.sr = {"abspielen":"Pusti","anhalten":"Pauza","uebersicht":"Pregled","schraeg":"Praćenje","oben":"Odozgo","fahrer":"Vozač","tag":"Dan","daemmerung":"Sumrak","nacht":"Noć","halb":"½ brzine","vonVorn":"Ispočetka","kamFolgt":"Kamera prati objašnjenje","mitdenken":"Razmišljaj: scena staje kod pitanja","md":"Razmišljaj","aufl":"Prikaži rešenje","weiter":"Dalje","richtigIst":"Tačno je","reihenfolge":"Redosled","kein3d":"Tvoj uređaj nažalost ne može da prikaže 3D prikaz. Objašnjenja ćeš naći ispod.","worum":"O čemu se radi?","merken":"Pravilo za pamćenje","rf":"Tačno i pogrešno","zeit":"Vremenska linija","kapitel":"Poglavlja","blick":"Ugao gledanja","tageszeit":"Promeni doba dana","fassung":"Verzija","teaserTitel":"Nastavak uz pun pristup","teaserText":"To je bila besplatna proba. Uz pun pristup vidiš celu scenu sa svim poglavljima i pitanjima:","teaserKnopf":"Zatraži pristup","nochmal":"Ponovi probu","gesperrt":"Uz pun pristup","buehne":"Animirana 3D scena","kapZurueck":"Nazad","kapWeiter":"Dalje","alleKap":"Sva poglavlja","ende":"Kraj scene","aufbau":"Scena se priprema …","zurFrage":"Na pitanje","schliessen":"Zatvori"};
UI.ckb = {"abspielen":"لێدان","anhalten":"ڕاگرتن","uebersicht":"دیمەنی گشتی","schraeg":"شوێنکەوتن","oben":"لە سەرەوە","fahrer":"شۆفێر","tag":"ڕۆژ","daemmerung":"تاریک و ڕوون","nacht":"شەو","halb":"½ خێرایی","vonVorn":"لە سەرەتاوە","kamFolgt":"کامێرا شوێن ڕوونکردنەوەکە دەکەوێت","mitdenken":"خۆت بیر بکەرەوە: دیمەنەکە لە کاتی پرسیاردا ڕادەوەستێت","md":"بیر بکەرەوە","aufl":"وەڵام پیشان بدە","weiter":"دواتر","richtigIst":"دروستەکەی ئەمەیە","reihenfolge":"ڕیزبەندییەکە","kein3d":"بەداخەوە ئامێرەکەت ناتوانێت وێنەی 3D پیشان بدات. ڕوونکردنەوەکان لە خوارەوە دەبینیت.","worum":"باسی چییە؟","merken":"یاساکە بۆ لەبەرکردن","rf":"دروست و هەڵە","zeit":"هێڵی کات","kapitel":"بڕگە","blick":"گۆشەی بینین","tageszeit":"گۆڕینی کاتی ڕۆژ","fassung":"وەشان","teaserTitel":"بە دەستگەیشتنی تەواو بەردەوام بە","teaserText":"ئەوە نموونە بەخۆڕاییەکە بوو. بە دەستگەیشتنی تەواو هەموو دیمەنەکە لەگەڵ هەموو بڕگە و پرسیارەکان دەبینیت:","teaserKnopf":"داوای دەستگەیشتن بکە","nochmal":"دووبارە نموونەکە","gesperrt":"بە دەستگەیشتنی تەواو","buehne":"دیمەنی جووڵاوی 3D","kapZurueck":"گەڕانەوە","kapWeiter":"دواتر","alleKap":"هەموو بڕگەکان","ende":"کۆتایی دیمەنەکە","aufbau":"دیمەنەکە ئامادە دەکرێت …","zurFrage":"بۆ پرسیارەکە","schliessen":"داخستن"};
UI.kmr = {"abspielen":"Lê bide","anhalten":"Rawestîne","uebersicht":"Nêrîna giştî","schraeg":"Bişopîne","oben":"Ji jor","fahrer":"Ajokar","tag":"Roj","daemmerung":"Berêvar","nacht":"Şev","halb":"½ lez","vonVorn":"Ji serî ve","kamFolgt":"Kamera ravekirinê dişopîne","mitdenken":"Bi me re bifikire: dîmen li ber pirsan radiweste","md":"Bifikire","aufl":"Bersivê nîşan bide","weiter":"Bidomîne","richtigIst":"Ya rast ev e","reihenfolge":"Rêz","kein3d":"Mixabin amûra te nikare dîmena 3D nîşan bide. Ravekirin li jêr in.","worum":"Mijar çi ye?","merken":"Qaîdeya ji bo bîrê","rf":"Rast û çewt","zeit":"Xeta demê","kapitel":"Beş","blick":"Goşeya dîtinê","tageszeit":"Dema rojê biguherîne","fassung":"Guherto","teaserTitel":"Bi gihîştina tevahî berdewam bike","teaserText":"Nimûne ev bû. Bi gihîştina tevahî tu dîmena tevahî bi hemû beş û pirsan dibînî:","teaserKnopf":"Gihîştinê bixwaze","nochmal":"Nimûneyê dîsa bibîne","gesperrt":"Bi gihîştina tevahî","buehne":"Dîmena 3D ya zindî","kapZurueck":"Vegere","kapWeiter":"Bidomîne","alleKap":"Hemû beş","ende":"Dawiya dîmenê","aufbau":"Dîmen tê avakirin …","zurFrage":"Ber bi pirsê","schliessen":"Bigire"};
UI.hi = {"abspielen":"चलाएँ","anhalten":"रोकें","uebersicht":"पूरा दृश्य","schraeg":"फ़ॉलो","oben":"ऊपर","fahrer":"ड्राइवर","tag":"दिन","daemmerung":"धुंधलका","nacht":"रात","halb":"½ स्पीड","vonVorn":"शुरू से","kamFolgt":"कैमरा समझाने के साथ चलता है","mitdenken":"साथ में सोचें: सवालों पर सीन रुकता है","md":"साथ में सोचें","aufl":"जवाब दिखाएँ","weiter":"आगे","richtigIst":"सही है","reihenfolge":"क्रम","kein3d":"माफ़ कीजिए, आपका डिवाइस 3D नहीं दिखा सकता। समझाने वाली बातें आपको नीचे मिलेंगी।","worum":"बात किस बारे में है?","merken":"याद रखने का नियम","rf":"सही और गलत","zeit":"टाइमलाइन","kapitel":"अध्याय","blick":"नज़रिया","tageszeit":"दिन का समय बदलें","fassung":"संस्करण","teaserTitel":"पूरे एक्सेस के साथ आगे देखें","teaserText":"यह मुफ़्त झलक थी। पूरे एक्सेस के साथ आप पूरा सीन सभी अध्यायों और सवालों के साथ देख सकते हैं:","teaserKnopf":"एक्सेस का अनुरोध करें","nochmal":"झलक फिर से","gesperrt":"पूरे एक्सेस के साथ","buehne":"एनिमेटेड 3D सीन","kapZurueck":"पीछे","kapWeiter":"आगे","alleKap":"सभी अध्याय","ende":"सीन समाप्त","aufbau":"सीन तैयार हो रहा है …","zurFrage":"सवाल पर जाएँ","schliessen":"बंद करें"};
UI.ur = {"abspielen":"چلائیں","anhalten":"روکیں","uebersicht":"مکمل منظر","schraeg":"فالو","oben":"اوپر سے","fahrer":"ڈرائیور","tag":"دن","daemmerung":"شام","nacht":"رات","halb":"½ رفتار","vonVorn":"شروع سے","kamFolgt":"کیمرہ وضاحت کے ساتھ چلتا ہے","mitdenken":"ساتھ سوچیں: سوالات پر منظر رک جاتا ہے","md":"ساتھ سوچیں","aufl":"جواب دکھائیں","weiter":"آگے","richtigIst":"درست یہ ہے","reihenfolge":"ترتیب","kein3d":"افسوس، آپ کا آلہ 3D منظر نہیں دکھا سکتا۔ وضاحتیں نیچے موجود ہیں۔","worum":"بات کس بارے میں ہے؟","merken":"یاد رکھنے کا قاعدہ","rf":"درست اور غلط","zeit":"ٹائم لائن","kapitel":"باب","blick":"زاویہ","tageszeit":"دن کا وقت بدلیں","fassung":"ورژن","teaserTitel":"مکمل رسائی کے ساتھ آگے دیکھیں","teaserText":"یہ مفت جھلک تھی۔ مکمل رسائی کے ساتھ آپ پورا منظر تمام ابواب اور سوالات کے ساتھ دیکھ سکتے ہیں:","teaserKnopf":"رسائی کی درخواست کریں","nochmal":"مفت جھلک دوبارہ","gesperrt":"مکمل رسائی کے ساتھ","buehne":"متحرک 3D منظر","kapZurueck":"واپس","kapWeiter":"آگے","alleKap":"تمام ابواب","ende":"منظر ختم","aufbau":"منظر تیار ہو رہا ہے …","zurFrage":"سوال پر جائیں","schliessen":"بند کریں"};
UI.vi = {"abspielen":"Phát","anhalten":"Tạm dừng","uebersicht":"Toàn cảnh","schraeg":"Đi theo","oben":"Từ trên","fahrer":"Người lái","tag":"Ngày","daemmerung":"Chạng vạng","nacht":"Đêm","halb":"½ tốc độ","vonVorn":"Từ đầu","kamFolgt":"Camera đi theo phần giải thích","mitdenken":"Cùng suy nghĩ: cảnh dừng lại khi có câu hỏi","md":"Cùng suy nghĩ","aufl":"Xem đáp án","weiter":"Tiếp","richtigIst":"Đúng là","reihenfolge":"Thứ tự","kein3d":"Rất tiếc, thiết bị của bạn không hiển thị được hình 3D. Phần giải thích nằm ở bên dưới.","worum":"Nội dung là gì?","merken":"Quy tắc cần nhớ","rf":"Đúng và sai","zeit":"Dòng thời gian","kapitel":"Chương","blick":"Góc nhìn","tageszeit":"Đổi thời điểm trong ngày","fassung":"Phiên bản","teaserTitel":"Xem tiếp với gói truy cập đầy đủ","teaserText":"Đó là bản dùng thử. Với gói truy cập đầy đủ, bạn xem được toàn bộ cảnh với tất cả các chương và câu hỏi:","teaserKnopf":"Yêu cầu quyền truy cập","nochmal":"Xem lại bản dùng thử","gesperrt":"Có trong gói đầy đủ","buehne":"Cảnh 3D động","kapZurueck":"Quay lại","kapWeiter":"Tiếp","alleKap":"Tất cả các chương","ende":"Hết cảnh","aufbau":"Đang dựng cảnh …","zurFrage":"Đến câu hỏi","schliessen":"Đóng"};
UI.rif = {"abspielen":"Ssekker","anhalten":"Bedd","uebersicht":"Kulci","schraeg":"Ḍfeṛ","oben":"Zi ennej","fahrer":"Anehhaṛ","tag":"Nnehaṛ","daemmerung":"Tameddit","nacht":"Iḍ","halb":"½ n ssuṛɛa","vonVorn":"Zi tazwara","kamFolgt":"Lkamira teḍfeṛ asefhem","mitdenken":"Xemmem aked-s: lmecheḍ ibedd ɣef isteqsiyen","md":"Xemmem","aufl":"Sken ajawab","weiter":"Kemmel","richtigIst":"Min iṣeḥḥan","reihenfolge":"Ttertib","kein3d":"Ssef, tilifun-nnec war yezmmer ca ad d-yessken 3D. Asefhem yella ddaw.","worum":"Ɣef min i tella?","merken":"Lqaɛida i ixeṣṣa ad tecfuḍ ɣef-s","rf":"Iṣeḥḥa d ixeṭṭa","zeit":"Axeṭṭ n lweqt","kapitel":"Iḥricen","blick":"Tama n uxẓaṛ","tageszeit":"Beddel lweqt n wass","fassung":"Nnusxa","teaserTitel":"Kemmel s lkunt kamel","teaserText":"Aya d ajeṛṛeb. S lkunt kamel ad tẓaṛeḍ lmecheḍ kamel s maṛṛa iḥricen d isteqsiyen:","teaserKnopf":"Ṭṭleb lkunt","nochmal":"Ɛawed ajeṛṛeb","gesperrt":"S lkunt kamel","buehne":"Lmecheḍ s 3D itteḥṛak","kapZurueck":"Uɣal","kapWeiter":"Kemmel","alleKap":"Maṛṛa iḥricen","ende":"Taggara n lmecheḍ","aufbau":"Lmecheḍ itteggi …","zurFrage":"Ɣer usteqsi","schliessen":"Ɣleq"};
// === SPRACHPAKETE-ENDE ===
const BUCHST = ["A", "B", "C", "D"];

// Tacho der Fahrersicht: 0-160 km/h auf 240 Grad (wie im echten Auto)
// Schulterblick-Zeichen: Auge mit Pfeil nach außen (ohne Text, gilt für alle Sprachen)
const AUGE_SVG = '<svg viewBox="0 0 48 24"><path d="M2 12C7 4 17 2 24 2s17 2 22 10c-5 8-15 10-22 10S7 20 2 12z" fill="#fff"/><circle cx="24" cy="12" r="6.5" fill="#1d261f"/><circle cx="26" cy="10" r="2" fill="#fff"/></svg>';
const TACHO_SVG = '<svg class="vv-tacho-svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47"/><line x1="11.9" y1="72.0" x2="17.1" y2="69.0" class="gross"/><line x1="7.5" y1="61.4" x2="10.4" y2="60.6"/><line x1="6.0" y1="50.0" x2="12.0" y2="50.0" class="gross"/><line x1="7.5" y1="38.6" x2="10.4" y2="39.4"/><line x1="11.9" y1="28.0" x2="17.1" y2="31.0" class="gross"/><line x1="18.9" y1="18.9" x2="21.0" y2="21.0"/><line x1="28.0" y1="11.9" x2="31.0" y2="17.1" class="gross"/><line x1="38.6" y1="7.5" x2="39.4" y2="10.4"/><line x1="50.0" y1="6.0" x2="50.0" y2="12.0" class="gross"/><line x1="61.4" y1="7.5" x2="60.6" y2="10.4"/><line x1="72.0" y1="11.9" x2="69.0" y2="17.1" class="gross"/><line x1="81.1" y1="18.9" x2="79.0" y2="21.0"/><line x1="88.1" y1="28.0" x2="82.9" y2="31.0" class="gross"/><line x1="92.5" y1="38.6" x2="89.6" y2="39.4"/><line x1="94.0" y1="50.0" x2="88.0" y2="50.0" class="gross"/><line x1="92.5" y1="61.4" x2="89.6" y2="60.6"/><line x1="88.1" y1="72.0" x2="82.9" y2="69.0" class="gross"/><text x="24.9" y="67.5">0</text><text x="21.0" y="53.0">20</text><text x="24.9" y="38.5">40</text><text x="35.5" y="27.9">60</text><text x="50.0" y="24.0">80</text><text x="64.5" y="27.9">100</text><text x="75.1" y="38.5">120</text><text x="79.0" y="53.0">140</text><text x="75.1" y="67.5">160</text><text x="50" y="41" class="einheit">km/h</text><g class="vv-tacho-nadel"><line x1="50" y1="56" x2="50" y2="12"/></g><circle cx="50" cy="50" r="5" class="mitte"/></svg>';

const CSS = `
.vv{--vv-bg:var(--bg,#FAF6EC);--vv-surface:var(--surface,#EEE6D3);--vv-strong:var(--surface-strong,#EAE3D2);--vv-tint:var(--surface-tint,#E3EADD);--vv-border:var(--border,rgba(43,40,30,.16));--vv-hair:var(--hairline,rgba(43,40,30,.24));
  --vv-text:var(--text,#2B2A22);--vv-muted:var(--muted,#6F6857);--vv-faint:var(--faint,#736B58);--vv-gruen:var(--gruen,#2F4A34);--vv-gruen-text:var(--gruen-text,#2F5A3C);--vv-gruen-hell:var(--gruen-hell,#5E8A68);
  --vv-gold:var(--gold,#D9954C);--vv-gold-text:var(--gold-text,#8F5A14);--vv-gold-s:var(--gold-schwach,rgba(217,149,76,.13));--vv-gold-r:var(--gold-rand,rgba(217,149,76,.35));--vv-warn:var(--warn,#A8442B);
  color:var(--vv-text);font-family:var(--ff-body,'Barlow',-apple-system,sans-serif);line-height:1.5;}
.vv *{box-sizing:border-box;}
.vv [hidden]{display:none!important;}
.vv button{font:inherit;color:inherit;}
.vv h2.vv-titel{font-family:var(--ff-titel,'Playfair Display',Georgia,serif);font-weight:700;font-size:24px;line-height:1.2;margin:0 0 4px;}
.vv .vv-kurz{color:var(--vv-muted);margin:0 0 10px;}
.vv .vv-karte{background:var(--vv-surface);border:1px solid var(--vv-border);border-radius:16px;padding:14px 16px;margin:12px 0;}
.vv .vv-karte h3{font-family:var(--ff-titel,'Playfair Display',Georgia,serif);font-weight:600;font-size:18px;margin:0 0 6px;}
.vv .vv-regel{display:inline-block;margin-top:8px;padding:3px 10px;border-radius:999px;background:var(--vv-gold-s);border:1px solid var(--vv-gold-r);color:var(--vv-gold-text);font-size:13.5px;font-weight:700;}
.vv .vv-buehne{position:relative;background:#9fb4c4;overflow:hidden;aspect-ratio:4/3;max-height:68vh;border-radius:16px;touch-action:manipulation;user-select:none;-webkit-user-select:none;}
@media (min-width:700px){.vv .vv-buehne{aspect-ratio:16/10;}}
.vv .vv-buehne canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}
.vv .vv-schicht{position:absolute;inset:0;pointer-events:none;}
.vv .vv-marke{position:absolute;transform:translate(-50%,-120%);max-width:none;padding:3px 9px;border-radius:999px;font-size:13px;font-weight:700;color:#fff;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);}
.vv .vv-ol{position:absolute;left:10px;top:10px;right:120px;display:flex;gap:6px;flex-wrap:wrap;}
.vv .vv-or{position:absolute;right:10px;top:10px;display:flex;gap:6px;}
[dir="rtl"].vv .vv-ol{left:120px;right:10px;} [dir="rtl"].vv .vv-or{right:auto;left:10px;}
.vv .vv-pille{min-height:40px;min-width:40px;padding:0 12px;border-radius:999px;border:none;background:rgba(20,24,22,.62);color:#fff;font-size:13.5px;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
.vv .vv-pille[aria-pressed="true"]{background:rgba(255,255,255,.92);color:#1d261f;}
.vv .vv-anz{position:absolute;left:10px;bottom:10px;padding:6px 12px;border-radius:999px;background:rgba(20,24,22,.62);color:#fff;font-size:13.5px;font-weight:700;max-width:calc(100% - 120px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.vv .vv-tempo{position:absolute;right:10px;bottom:10px;padding:6px 12px;border-radius:12px;background:rgba(20,24,22,.62);color:#fff;font-variant-numeric:tabular-nums;font-weight:700;font-size:15px;}
[dir="rtl"].vv .vv-anz{left:auto;right:10px;} [dir="rtl"].vv .vv-tempo{right:auto;left:10px;}
.vv .vv-tempo small{font-size:12.5px;opacity:.8;font-weight:600;}
.vv .vv-fehler{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;background:var(--vv-surface);}
.vv .vv-teaser{margin-top:10px;}
.vv .vv-bau{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;}
.vv .vv-bau span{padding:8px 16px;border-radius:999px;background:rgba(20,24,22,.7);color:#fff;font-weight:700;font-size:14px;}
.vv .vv-kamreihe{display:none;}
.vv .vv-kapliste{display:none;}
.vv .vv-kk-nav{display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;}
.vv .vv-kk-nav .vv-knopf{flex:1 1 0;min-width:0;}
.vv .vv-knopf.haupt-leicht{background:var(--vv-tint);color:var(--vv-gruen-text);border-color:var(--vv-gruen-hell);}
.vv .vv-knopf:disabled{opacity:.45;cursor:default;}
.vv .vv-knopf{white-space:normal;text-align:center;line-height:1.2;padding:6px 14px;}
.vv .vv-teaser-karte{background:var(--vv-surface);border:2px solid var(--vv-gold-r);border-radius:16px;padding:16px 18px;box-shadow:0 6px 20px rgba(0,0,0,.12);}
.vv .vv-buehne.gedimmt canvas{filter:brightness(.55) saturate(.7);}
.vv .vv-teaser-karte h3{font-family:var(--ff-titel,'Playfair Display',Georgia,serif);font-size:20px;margin:0 0 6px;}
.vv .vv-teaser-karte ul{margin:8px 0 12px;padding-inline-start:20px;font-size:14.5px;}
.vv .vv-steuer{display:flex;align-items:center;gap:8px;margin:10px 0 0;}
.vv .vv-zurfrage{flex:none;padding:0 14px 0 12px;}
.vv .vv-zurfrage[hidden]{display:none;}
.vv .vv-knopf{min-height:44px;min-width:44px;padding:0 14px;border-radius:999px;border:1px solid var(--vv-hair);background:var(--vv-surface);font-weight:700;font-size:14.5px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;}
.vv .vv-knopf.haupt{background:var(--vv-gruen);color:#fff;border-color:transparent;min-width:52px;}
.vv .vv-knopf.gold{background:var(--vv-gold);color:#2B2A22;border-color:transparent;}
.vv .vv-knopf[aria-pressed="true"]{background:var(--vv-tint);color:var(--vv-gruen-text);border-color:var(--vv-gruen-hell);}
.vv .vv-knopf svg{width:20px;height:20px;fill:currentColor;}
.vv .vv-zl{position:relative;flex:1;height:44px;cursor:pointer;touch-action:none;}
.vv .vv-zl-bahn{position:absolute;left:0;right:0;top:19px;height:6px;border-radius:3px;background:var(--vv-strong);border:1px solid var(--vv-border);}
.vv .vv-zl-fuell{position:absolute;left:0;top:19px;height:6px;border-radius:3px;background:var(--vv-gold);width:0;}
[dir="rtl"].vv .vv-zl{transform:scaleX(-1);}
.vv .vv-zl-strich{position:absolute;top:14px;width:3px;height:16px;margin-left:-1.5px;border-radius:2px;background:var(--vv-gruen-hell);pointer-events:none;}
.vv .vv-zl-strich.aktiv{background:var(--vv-gold-text);}
.vv .vv-chips{display:flex;gap:8px;overflow-x:auto;padding:8px 2px 4px;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.vv .vv-chips::-webkit-scrollbar{display:none;}
.vv .vv-chip{flex:none;min-height:44px;padding:6px 14px 6px 6px;border-radius:999px;border:1px solid var(--vv-hair);background:var(--vv-surface);font-size:14px;font-weight:600;display:inline-flex;align-items:center;gap:8px;cursor:pointer;}
.vv .vv-chip b{width:28px;height:28px;border-radius:50%;background:var(--vv-tint);color:var(--vv-gruen-text);display:inline-flex;align-items:center;justify-content:center;font-size:13.5px;}
.vv .vv-chip.aktiv{border-color:var(--vv-gold-r);background:var(--vv-gold-s);}
.vv .vv-chip.aktiv b{background:var(--vv-gold);color:#2B2A22;}
.vv .vv-chip.zu{opacity:.62;border-style:dashed;}
.vv .vv-chip .fz{color:var(--vv-gold-text);font-weight:800;}
.vv .vv-reihe{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}
.vv .vv-segment{display:flex;padding:4px;border-radius:999px;background:var(--vv-strong);border:1px solid var(--vv-border);margin:4px 0 12px;}
.vv .vv-segment button{flex:1;min-height:44px;border:none;border-radius:999px;background:none;font-weight:700;font-size:15px;color:var(--vv-muted);cursor:pointer;}
.vv .vv-segment button[aria-pressed="true"]{background:var(--vv-bg);color:var(--vv-text);box-shadow:0 1px 4px rgba(0,0,0,.12);}
.vv .vv-segment button.falsch[aria-pressed="true"]{color:var(--vv-warn);}
.vv .vv-schalter{display:flex;align-items:center;gap:10px;min-height:44px;margin-top:6px;cursor:pointer;font-weight:600;}
.vv .vv-schalter input{width:22px;height:22px;accent-color:var(--vv-gruen);}
.vv .vv-kk{border-inline-start:4px solid var(--vv-gruen-hell);}
.vv .vv-kk.falsch{border-inline-start-color:var(--vv-warn);}
.vv .vv-kk-kopf{display:flex;align-items:baseline;gap:8px;}
.vv .vv-kk-nr{font-size:13.5px;font-weight:700;color:var(--vv-faint);white-space:nowrap;flex:none;}
.vv .vv-kk h3{margin:0;font-size:20px;}
.vv .vv-kk p{margin:6px 0 0;}
.vv .vv-md{margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--vv-bg);border:1px solid var(--vv-hair);}
.vv .vv-md-frage{font-weight:700;margin:0 0 8px;}
.vv .vv-md ul,.vv .vv-md ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;}
.vv .vv-md li{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:12px;border:1px solid var(--vv-border);}
.vv .vv-md li b{flex:none;width:24px;height:24px;border-radius:50%;background:var(--vv-strong);display:flex;align-items:center;justify-content:center;font-size:13px;}
.vv .vv-md li.loesung{border-color:var(--vv-gruen-hell);background:var(--vv-tint);font-weight:600;}
.vv .vv-md li.loesung b{background:var(--vv-gruen);color:#fff;}
.vv .vv-md-erkl{margin:10px 0 0;}
.vv .vv-md-knoepfe{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
.vv .vv-merken ol{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;counter-reset:m;}
.vv .vv-merken li{counter-increment:m;display:grid;grid-template-columns:28px 1fr;gap:8px;}
.vv .vv-merken li::before{content:counter(m);width:26px;height:26px;border-radius:50%;background:var(--vv-tint);color:var(--vv-gruen-text);font-weight:700;font-size:13.5px;display:flex;align-items:center;justify-content:center;}
.vv .vv-merken .par{display:block;color:var(--vv-gold-text);font-size:13.5px;font-weight:700;margin-top:2px;}
.vv :focus-visible{outline:3px solid var(--vv-gold);outline-offset:2px;}
/* Handy: nichts über dem Bild außer Tageszeit und Tempo, nichts seitlich abgeschnitten */
@media (max-width:560px){
  .vv .vv-ol,.vv .vv-anz,.vv .vv-chips{display:none;}
  .vv .vv-pille{min-height:36px;padding:0 12px;font-size:13px;}
  .vv .vv-tempo{font-size:14px;padding:5px 10px;}
  .vv .vv-buehne{aspect-ratio:4/3.2;border-radius:14px;}
  .vv .vv-kamreihe{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:4px;padding:4px;margin-top:8px;border-radius:14px;background:var(--vv-strong);border:1px solid var(--vv-border);}
  .vv .vv-kamreihe button{min-height:42px;border:none;border-radius:10px;background:none;font-weight:700;font-size:13.5px;color:var(--vv-muted);cursor:pointer;padding:2px 4px;line-height:1.15;overflow-wrap:anywhere;}
  .vv .vv-kamreihe button[aria-pressed="true"]{background:var(--vv-bg);color:var(--vv-text);box-shadow:0 1px 4px rgba(0,0,0,.12);}
  .vv .vv-kapliste{display:block;margin-top:10px;border:1px solid var(--vv-hair);border-radius:14px;background:var(--vv-surface);}
  .vv .vv-kapliste summary{min-height:48px;display:flex;align-items:center;gap:6px;padding:0 16px;font-weight:700;cursor:pointer;list-style:none;}
  .vv .vv-kapliste summary::-webkit-details-marker{display:none;}
  .vv .vv-kapliste summary::after{content:"▾";margin-inline-start:auto;color:var(--vv-muted);}
  .vv .vv-kapliste[open] summary::after{content:"▴";}
  .vv .vv-kapliste-inhalt{display:flex;flex-direction:column;padding:0 8px 8px;gap:4px;}
  .vv .vv-kl-zeile{display:flex;align-items:center;gap:10px;min-height:48px;padding:6px 10px;border:none;border-radius:10px;background:none;text-align:start;font-size:15px;font-weight:600;cursor:pointer;}
  .vv .vv-kl-zeile b{flex:none;width:28px;height:28px;border-radius:50%;background:var(--vv-tint);color:var(--vv-gruen-text);display:inline-flex;align-items:center;justify-content:center;font-size:13.5px;}
  .vv .vv-kl-zeile span:first-of-type{flex:1;min-width:0;}
  .vv .vv-kl-zeile.aktiv{background:var(--vv-gold-s);}
  .vv .vv-kl-zeile.aktiv b{background:var(--vv-gold);color:#2B2A22;}
  .vv .vv-kl-zeile.zu{opacity:.65;}
  .vv .vv-kl-zeile .fz{color:var(--vv-gold-text);font-weight:800;}
  .vv .vv-reihe .vv-knopf{flex:1 1 auto;}
}
@media (prefers-color-scheme: dark){.vv .vv-buehne{background:#3a4650;}}
/* Cockpit (Fahrersicht, 01.10.2026) */
.vv .vv-cockpit{display:none;position:absolute;left:50%;bottom:0;transform:translateX(-50%);align-items:center;justify-content:center;gap:4%;width:46%;pointer-events:none;direction:ltr;}
.vv .vv-buehne.cockpit .vv-cockpit{display:flex;}
.vv .vv-buehne.cockpit .vv-tempo{display:none;}
.vv .vv-buehne.cockpit .vv-anz{bottom:calc(clamp(56px,24%,120px) + 8px);}
.vv .vv-tacho{position:relative;height:88%;aspect-ratio:1;}
.vv .vv-tacho-svg{width:100%;height:100%;display:block;}
.vv .vv-tacho-svg circle{fill:#0b0e11;stroke:#f2f4f6;stroke-width:2.5;}
.vv .vv-tacho-svg line{stroke:#f2f4f6;stroke-width:1.2;}
.vv .vv-tacho-svg line.gross{stroke-width:2;}
.vv .vv-tacho-svg text{fill:#f2f4f6;font:700 8px system-ui,sans-serif;text-anchor:middle;}
.vv .vv-tacho-svg text.einheit{font-size:6.5px;font-weight:600;opacity:.8;}
.vv .vv-tacho-nadel line{stroke:#e5322d;stroke-width:3;stroke-linecap:round;}
.vv .vv-tacho-svg circle.mitte{fill:#9aa3ab;stroke:none;}
.vv .vv-tacho-zahl{position:absolute;left:0;right:0;top:66%;text-align:center;color:#fff;font:800 clamp(8px,2.2vmin,13px)/1 system-ui,sans-serif;font-variant-numeric:tabular-nums;}
.vv .vv-pfeil{width:clamp(18px,11%,34px);aspect-ratio:1;display:block;}
.vv .vv-pfeil svg{width:100%;height:100%;fill:#2f3a33;}
.vv .vv-pfeil.an svg{fill:#27d05a;filter:drop-shadow(0 0 4px #27d05a);}
.vv .vv-schulter{position:absolute;display:none;justify-content:center;pointer-events:none;}
.vv .vv-schulter.l{left:6px;} .vv .vv-schulter.r{right:6px;}
.vv .vv-buehne.cockpit .vv-schulter.an{display:flex;}
.vv .vv-schulter svg{width:44px;height:22px;padding:4px 7px;border-radius:999px;background:#ffc21a;box-sizing:content-box;box-shadow:0 2px 8px rgba(0,0,0,.35);}
.vv .vv-voll{display:none;}
/* Handy quer: Fahrersicht als Vollbild (Knöpfe nur Abspielen und Schließen, oben rechts) */
@media (orientation:landscape) and (max-height:520px){
  .vv .vv-buehne.cockpit{position:fixed;inset:0;z-index:10000;aspect-ratio:auto;max-height:none;border-radius:0;background:#000;}
  .vv .vv-buehne.cockpit .vv-or{display:none;}
  .vv .vv-buehne.cockpit .vv-voll{display:flex;position:absolute;top:8px;right:8px;gap:8px;}
}
`;

// Eine 3D-Welt (WebGL) für alle Szenen: Anlegen kostet auf dem Handy bis 1 s, Verwerfen
// (forceContextLoss) bis 4 s -- beides passierte bei jedem Öffnen und Verlassen (Ruckler).
// Jetzt wird die Welt beim Verlassen nur ausgeräumt und von der nächsten Szene übernommen.
let geteilteWelt = null, geteiltBelegt = false;

function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function winkelDiff(a, b){ return Math.atan2(Math.sin(b - a), Math.cos(b - a)); }

// Variante aus den Daten abspielbar machen: pose(t), sig(t), Hilfsflächen
export function vorbereiten(V){
  const dt = V.dt;
  const fz = V.fahrzeuge.map((f) => {
    const P = f.P, SIG = f.SIG;
    let lenk = null;
    if(P){
      const m = P.length / 5; lenk = new Float32Array(m);
      for(let i = 0; i < m; i++){
        const a = Math.max(0, i - 2), b = Math.min(m - 1, i + 2);
        const ds = P[b * 5 + 4] - P[a * 5 + 4], dh = winkelDiff(P[a * 5 + 2], P[b * 5 + 2]);
        lenk[i] = Math.abs(ds) > 0.05 ? Math.atan(2.6 * dh / ds) / 2.2 : 0;
      }
    }
    const bitsBei = (t) => SIG ? SIG[Math.max(0, Math.min(SIG.length - 1, Math.round(t / dt)))] : (f.sig0 || 0);
    const pose = (t) => {
      const bits = bitsBei(t);
      if(!P){ const q = f.pose; return { x: q[0], z: q[1], h: q[2], v: 0, s: 0, lenk: 0, sichtbar: !(bits & 128) }; }
      const m = P.length / 5, u = Math.max(0, Math.min(m - 1, t / dt)), i = Math.min(m - 2, Math.floor(u)), k = u - i, a = i * 5, b = a + 5;
      return { x: P[a] + (P[b] - P[a]) * k, z: P[a + 1] + (P[b + 1] - P[a + 1]) * k, h: P[a + 2] + winkelDiff(P[a + 2], P[b + 2]) * k,
        v: P[a + 3] + (P[b + 3] - P[a + 3]) * k, s: P[a + 4] + (P[b + 4] - P[a + 4]) * k, lenk: lenk[i] + (lenk[i + 1] - lenk[i]) * k, sichtbar: !(bits & 128) };
    };
    const sig = (t) => {
      const b = bitsBei(t);
      return { blinker: b & 1 ? "links" : b & 2 ? "rechts" : null, bremse: !!(b & 4), warnblink: !!(b & 8),
        schulter: (b & 96) === 96 ? (Math.floor(t * 1.2) % 2 ? "links" : "rechts") : b & 32 ? "links" : b & 64 ? "rechts" : null,
        spiegel: b & 256 ? "innen" : b & 512 ? "links" : b & 1024 ? "rechts" : null, lichthupe: !!(b & 2048), rundum: !!(b & 4096) };
    };
    return { id: f.id, spec: f, pose, sig };
  });
  // Bahnen zum Ausrichten der Schilder (Fokus zuerst)
  const spuren = [];
  fz.slice().sort((a, b) => (b.id === V.fokus) - (a.id === V.fokus)).forEach((f) => {
    if(!f.spec.P || ["fussgaenger", "kind", "ball"].indexOf(f.spec.typ) !== -1) return;
    const sp = [];
    for(let t = 0; t < V.dauer; t += 0.5){ const p = f.pose(t), q = f.pose(t + 0.5), dx = q.x - p.x, dz = q.z - p.z, l = Math.hypot(dx, dz); if(l > 0.3) sp.push([p.x, p.z, dx / l, dz / l]); }
    spuren.push(sp);
  });
  const hilfen = (t) => {
    const out = (V.hilfenFest || []).slice();
    if(V.hilfen && V.hilfen.length) (V.hilfen[Math.max(0, Math.min(V.hilfen.length - 1, Math.round(t / dt)))] || []).forEach((h) => out.push(h));
    return out;
  };
  return { fahrzeuge: fz, spuren, hilfen };
}

export function starte(el, daten, opt){
  opt = opt || {};
  const sprache = UI[opt.sprache] ? opt.sprache : "de";
  const U = UI[sprache];
  const T = (daten.texte && (daten.texte[sprache] || daten.texte.de)) || {};
  const TD = (daten.texte && daten.texte.de) || {};
  const kapTxt = (id) => (T.kapitel && T.kapitel[id]) || (TD.kapitel && TD.kapitel[id]) || { titel: "", text: "" };
  const ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const teaser = daten.teaser || null;

  if(!document.getElementById("vv-stil")){ const s = document.createElement("style"); s.id = "vv-stil"; s.textContent = CSS; document.head.appendChild(s); }
  const wurzel = document.createElement("div");
  wurzel.className = "vv"; wurzel.dir = ["ar", "ckb", "ur"].indexOf(sprache) !== -1 ? "rtl" : "ltr"; wurzel.lang = sprache;
  const mehrere = daten.varianten.length > 1;
  const merken = T.merken || TD.merken;
  wurzel.innerHTML =
    (opt.kopf === false ? "" : '<h2 class="vv-titel">' + esc(T.titel || TD.titel) + '</h2><p class="vv-kurz">' + esc(T.kurz || TD.kurz) + "</p>") +
    ((T.worum || TD.worum) ? '<section class="vv-karte"><h3>' + esc(U.worum) + '</h3><p style="margin:0">' + esc(T.worum || TD.worum) + '</p><span class="vv-regel">' + esc(T.worumRegel || TD.worumRegel) + "</span></section>" : "") +
    (mehrere ? '<div class="vv-segment" role="group" aria-label="' + esc(U.fassung) + '">' + daten.varianten.map((v) => '<button type="button" data-var="' + esc(v.name) + '" class="' + (v.name === "falsch" ? "falsch" : "") + '" aria-pressed="false">' + esc(((T.varianten || TD.varianten) || {})[v.name] || v.name) + "</button>").join("") + "</div>" : "") +
    '<div class="vv-buehne"><canvas aria-label="' + esc(U.buehne) + '"></canvas><div class="vv-schicht"></div>' +
      '<div class="vv-ol" role="group" aria-label="' + esc(U.blick) + '"></div>' +
      '<div class="vv-or"><button type="button" class="vv-pille" data-tz aria-label="' + esc(U.tageszeit) + '">' + esc(U.tag) + "</button></div>" +
      '<div class="vv-anz" aria-live="polite"></div><div class="vv-tempo" aria-hidden="true"></div>' +
      '<div class="vv-cockpit" aria-hidden="true"><span class="vv-pfeil l"><svg viewBox="0 0 24 24"><path d="M3 12l8-7v4.5h10v5H11V19z"/></svg></span>' +
        '<div class="vv-tacho">' + TACHO_SVG + '<b class="vv-tacho-zahl"></b></div>' +
        '<span class="vv-pfeil r"><svg viewBox="0 0 24 24"><path d="M21 12l-8-7v4.5H3v5h10V19z"/></svg></span></div>' +
      '<span class="vv-schulter l" aria-hidden="true">' + AUGE_SVG + '</span><span class="vv-schulter r" aria-hidden="true">' + AUGE_SVG + '</span>' +
      '<div class="vv-voll"><button type="button" class="vv-pille" data-vollspiel aria-label="' + esc(U.abspielen) + '"></button><button type="button" class="vv-pille" data-vollzu aria-label="' + esc(U.schliessen) + '"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.4 5L5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z"/></svg></button></div>' +
      '<div class="vv-bau" aria-live="polite"><span>' + esc(U.aufbau) + '</span></div>' +
      '<div class="vv-fehler" hidden><p>' + esc(U.kein3d) + '</p></div></div>' +
    '<div class="vv-kamreihe" role="group" aria-label="' + esc(U.blick) + '"></div>' +
    '<div class="vv-teaser" hidden></div>' +
    '<div class="vv-steuer"><button type="button" class="vv-knopf haupt" data-spielen aria-label="' + esc(U.abspielen) + '"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>' +
      '<div class="vv-zl" role="slider" tabindex="0" aria-label="' + esc(U.zeit) + '" aria-valuemin="0"><div class="vv-zl-bahn"></div><div class="vv-zl-fuell"></div></div>' +
      '<button type="button" class="vv-knopf gold vv-zurfrage" data-zurfrage hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l5-5 1.4 1.4L12 19.8 4.6 12.4 6 11l5 5z"/></svg>' + esc(U.zurFrage) + "</button></div>" +
    '<section class="vv-karte vv-kk" aria-live="polite"><div class="vv-kk-kopf"><span class="vv-kk-nr"></span><h3 class="vv-kk-titel"></h3></div><p class="vv-kk-text"></p><span class="vv-regel vv-kk-regel"></span><div class="vv-kk-frage"></div>' +
      '<div class="vv-kk-nav"><button type="button" class="vv-knopf" data-kapzur>‹ ' + esc(U.kapZurueck) + '</button><button type="button" class="vv-knopf haupt-leicht" data-kapvor>' + esc(U.kapWeiter) + " ›</button></div></section>" +
    '<div class="vv-chips" role="group" aria-label="' + esc(U.kapitel) + '"></div>' +
    '<details class="vv-kapliste"><summary>' + esc(U.alleKap) + ' <span class="vv-kapliste-n"></span></summary><div class="vv-kapliste-inhalt"></div></details>' +
    '<div class="vv-reihe"><button type="button" class="vv-knopf" data-halb aria-pressed="false">' + esc(U.halb) + '</button><button type="button" class="vv-knopf" data-vorn>' + esc(U.vonVorn) + '</button><button type="button" class="vv-knopf" data-autokam aria-pressed="true">' + esc(U.kamFolgt) + "</button></div>" +
    '<label class="vv-schalter"><input type="checkbox" data-md> ' + esc(U.mitdenken) + "</label>" +
    (mehrere && (T.rf || TD.rf) ? '<section class="vv-karte"><h3>' + esc(U.rf) + '</h3><p style="margin:0" class="vv-rf-text"></p><div class="vv-md-knoepfe"><button type="button" class="vv-knopf" data-rf></button></div></section>' : "") +
    (merken ? '<section class="vv-karte vv-merken"><h3>' + esc(U.merken) + "</h3><ol>" + merken.map((m) => "<li><span>" + esc(m[0]) + '<span class="par">' + esc(m[1]) + "</span></span></li>").join("") + "</ol></section>" : "") +
    '<div class="vv-platzhalter" aria-hidden="true"></div>';
  el.appendChild(wurzel);
  const $ = (s) => wurzel.querySelector(s);
  const $$ = (s) => Array.from(wurzel.querySelectorAll(s));

  // 26.09.2026 (Ruckler): Die 3D-Welt wird stückweise aufgebaut, mit einer Pause nach
  // jedem Schritt. Vorher lief alles in einem Stück, das Handy reagierte beim Öffnen einer
  // Szene 1-3 Sekunden lang nicht. Texte und Kapitel stehen sofort da.
  let welt = null, bauNr = 0;
  const naechstesBild = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  const luftHolen = () => new Promise((r) => setTimeout(r, 0));   // Eingaben durchlassen, ohne auf ein Bild zu warten

  const st = { variante: null, t: 0, laeuft: false, tempo: 1, mitdenken: false, autoKam: true, kapitel: -1, wartet: false, aufgeloest: false, tz: "tag", bedarf: 2, aus: false };
  let V = null, VB = null;

  function kameraKnoepfe(){
    const arten = (V.kameraOpt && V.kameraOpt.fest ? ["uebersicht"] : []).concat(["schraeg", "oben", "fahrer"]);
    $(".vv-ol").innerHTML = arten.map((a) => '<button type="button" class="vv-pille" data-kam="' + a + '" aria-pressed="false">' + esc(U[a]) + "</button>").join("");
    $(".vv-kamreihe").innerHTML = arten.map((a) => '<button type="button" data-kam="' + a + '" aria-pressed="false">' + esc(U[a]) + "</button>").join("");
    $$("[data-kam]").forEach((b) => b.addEventListener("click", () => kameraSetzen(b.dataset.kam, true)));
  }

  function variante(name){
    V = daten.varianten.find((v) => v.name === name) || daten.varianten[0];
    st.variante = V.name; VB = vorbereiten(V);
    $$("[data-var]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.var === V.name)));
    $(".vv-kk").classList.toggle("falsch", V.name === "falsch");
    kameraKnoepfe();
    zeitleisteBauen();
    const rt = $(".vv-rf-text");
    if(rt){ const rf = T.rf || TD.rf, kn = T.rfKnopf || TD.rfKnopf, andere = daten.varianten.find((v) => v.name !== V.name); rt.textContent = rf[V.name] || ""; $("[data-rf]").textContent = andere ? kn[andere.name] : ""; }
    springe(0, true);
    aufbau3d();
  }

  async function aufbau3d(){
    const nr = ++bauNr, Vb = V, VBb = VB;
    const weg = () => nr !== bauNr || st.aus;
    st.bauend = true; $(".vv-bau").hidden = false;
    await naechstesBild(); if(weg()) return;
    if(!welt){
      if(geteilteWelt && !geteiltBelegt && !geteilteWelt.renderer.getContext().isContextLost()){
        welt = geteilteWelt;
        const alt = $(".vv-buehne canvas"), neu = welt.renderer.domElement;
        neu.setAttribute("aria-label", alt.getAttribute("aria-label") || "");
        alt.replaceWith(neu);
        welt.alleHilfenAus(); if(welt.zeitStufe !== "tag") welt.setzeTageszeit("tag");
      } else {
        try{ welt = erstelleWelt($("canvas"), { qualitaet: opt.qualitaet || "hoch" }); }
        catch(e){ st.bauend = false; $(".vv-bau").hidden = true; $(".vv-fehler").hidden = false; $(".vv-tempo").hidden = true; return; }
        if(!geteilteWelt || geteilteWelt.renderer.getContext().isContextLost()) geteilteWelt = welt;
      }
      if(welt === geteilteWelt) geteiltBelegt = true;
      beobachten();
      if(st.tz !== "tag") welt.setzeTageszeit(st.tz);
      await naechstesBild(); if(weg()) return;
    }
    welt.leereFahrzeuge();
    if(welt.strasse){ welt.szene.remove(welt.strasse); welt.freigeben(welt.strasse); welt.strasse = null; }
    welt.dreher = []; welt.ticker = [];
    welt.kameraOpt = Vb.kameraOpt || {};
    welt.strasse = Vb.welt.art === "landstrasse" ? baueLandstrasse(welt, Vb.welt.def)
      : baueKompassWelt(welt, Vb.welt.strasse, { kategorie: daten.kategorie, spuren: VBb.spuren });
    await luftHolen(); if(weg()) return;
    for(let i = 0; i < VBb.fahrzeuge.length; i++){
      const f = VBb.fahrzeuge[i];
      welt.fahrzeug(f.id, baueTeilnehmer(welt.M, f.spec, i), f.pose, f.sig);
      if(i % 2 === 1){ await luftHolen(); if(weg()) return; }
    }
    welt.groesse(); welt.stellen(st.t);
    // Grafik-Programme möglichst im Hintergrund übersetzen (wo das Gerät das kann)
    try{ if(welt.renderer.compileAsync) await welt.renderer.compileAsync(welt.szene, welt.kamera); }catch(e){}
    if(weg()) return;
    st.bauend = false; $(".vv-bau").hidden = true;
    welt.setzeKamera(st.kamera || Vb.grundKamera || "schraeg", true);
    st.bedarf = Math.max(st.bedarf, 3);
  }

  function zeitleisteBauen(){
    const zl = $(".vv-zl"), chips = $(".vv-chips");
    $$(".vv-zl-strich").forEach((m) => m.remove());
    zl.setAttribute("aria-valuemax", String(V.dauer));
    chips.innerHTML = "";
    V.kapitel.forEach((k, i) => {
      const s = document.createElement("div"); s.className = "vv-zl-strich"; s.style.left = (k.t / V.dauer * 100) + "%"; zl.appendChild(s);
      const b = document.createElement("button"); b.type = "button"; b.className = "vv-chip";
      const tx = kapTxt(k.id);
      b.innerHTML = "<b>" + (i + 1) + "</b><span>" + esc(tx.titel) + "</span>" + (tx.frage ? '<span class="fz" aria-hidden="true">?</span>' : "");
      b.addEventListener("click", () => springe(k.t + 0.01, true));
      chips.appendChild(b);
    });
    const liste = $(".vv-kapliste-inhalt");
    liste.innerHTML = "";
    V.kapitel.forEach((k, i) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "vv-kl-zeile";
      const tx = kapTxt(k.id);
      b.innerHTML = "<b>" + (i + 1) + "</b><span>" + esc(tx.titel) + "</span>" + (tx.frage ? '<span class="fz" aria-hidden="true">?</span>' : "");
      b.addEventListener("click", () => { springe(k.t + 0.01, true); $(".vv-kapliste").open = false; $(".vv-buehne").scrollIntoView({ block: "start", behavior: ruhig ? "auto" : "smooth" }); });
      liste.appendChild(b);
    });
    if(teaser && teaser.gesperrt) teaser.gesperrt.forEach((titel, j) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "vv-kl-zeile zu";
      b.innerHTML = "<b>" + (V.kapitel.length + j + 1) + "</b><span>" + esc(titel) + '</span><span class="fz" aria-hidden="true">🔒</span>';
      b.setAttribute("aria-label", titel + " · " + U.gesperrt);
      b.addEventListener("click", () => { spielen(false); $(".vv-kapliste").open = false; teaserZeigen(); });
      liste.appendChild(b);
    });
    $(".vv-kapliste-n").textContent = "(" + (V.kapitel.length + (teaser && teaser.gesperrt ? teaser.gesperrt.length : 0)) + ")";
    if(teaser && teaser.gesperrt){
      teaser.gesperrt.forEach((titel, j) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "vv-chip zu";
        b.innerHTML = "<b>" + (V.kapitel.length + j + 1) + '</b><span>' + esc(titel) + '</span><span class="fz" aria-hidden="true">🔒</span>';
        b.setAttribute("aria-label", titel + " · " + U.gesperrt);
        b.addEventListener("click", () => { spielen(false); teaserZeigen(); });
        chips.appendChild(b);
      });
    }
  }

  function aktKapitel(t){ let n = -1; V.kapitel.forEach((k, i) => { if(t >= k.t - 1e-6) n = i; }); return n; }
  function kapitelZeigen(n){
    kkVorher();
    st.kapitel = n; st.aufgeloest = false;
    const k = V.kapitel[Math.max(0, n)], tx = kapTxt(k.id);
    const gesamt = V.kapitel.length + (teaser && teaser.gesperrt ? teaser.gesperrt.length : 0);
    $(".vv-kk-nr").textContent = (Math.max(0, n) + 1) + " / " + gesamt;
    $(".vv-kk-titel").textContent = tx.titel; $(".vv-kk-text").textContent = tx.text;
    $(".vv-kk-regel").textContent = tx.regel || ""; $(".vv-kk-regel").hidden = !tx.regel;
    $(".vv-anz").textContent = (Math.max(0, n) + 1) + " · " + tx.titel;
    $$(".vv-zl-strich").forEach((m, i) => m.classList.toggle("aktiv", i === n));
    $$(".vv-kl-zeile").forEach((m, i) => m.classList.toggle("aktiv", i === Math.max(0, n)));
    const nr = Math.max(0, n), letztes = nr >= V.kapitel.length - 1;
    $("[data-kapzur]").disabled = nr === 0;
    $("[data-kapvor]").disabled = letztes && !teaser;
    $$(".vv-chip").forEach((m, i) => {
      m.classList.toggle("aktiv", i === n);
      if(i === n) chipMitte(m);
    });
    frageZeigen(tx.frage, false);
    if(st.autoKam && k.kamera) kameraSetzen(k.kamera, false);
    kkNachher();
  }

  // Die Kapitelkarte ist mit Frage viel höher als ohne. Schrumpfte sie, wurde die Seite
  // kürzer und der Browser schob alles nach unten (Bild sprang). Ein unsichtbarer Platzhalter
  // am Ende gleicht das aus: die Seite wird während einer Szene nie kürzer.
  let kkMax = 0, kkBreite = 0;
  function kkVorher(){
    // vorübergehend großzügig, damit auch die Zwischen-Messung nichts kürzt
    $(".vv-platzhalter").style.height = (kkMax + $(".vv-kk").offsetHeight) + "px";
  }
  function kkNachher(){
    const b = wurzel.clientWidth, h = $(".vv-kk").offsetHeight;
    if(b !== kkBreite){ kkBreite = b; kkMax = 0; }
    if(h > kkMax) kkMax = h;
    $(".vv-platzhalter").style.height = (kkMax - h) + "px";
    frageKnopf();
  }

  // Hält die Szene bei einer Frage an und die Frage ist nicht ganz zu sehen
  // (Handy: unter dem Bild, Antworten hinter der Fußleiste), erscheint neben der Zeitleiste "Zur Frage ↓".
  // Gescrollt wird nur auf Fingertipp, nie von selbst.
  let frageImBlick = true;
  function frageKnopf(){
    const k = $("[data-zurfrage]"); if(!k) return;
    k.hidden = !(st.wartet && !frageImBlick && $(".vv-md"));
  }
  function bildZeigen(){
    // nach "Weiter" in der Frage: Bild zurück in den Blick, falls es oben herausgerollt ist
    const r = $(".vv-buehne").getBoundingClientRect();
    if(r.top < 0 || r.bottom > window.innerHeight) try{ $(".vv-buehne").scrollIntoView({ block: "nearest", behavior: ruhig ? "auto" : "smooth" }); }catch(e){}
  }

  // Nur den Chip-Streifen waagerecht verschieben – scrollIntoView würde auch die
  // ganze Seite senkrecht mitziehen, dann rutscht das Bild beim Abspielen weg
  function chipMitte(m){
    const leiste = m.parentNode;
    if(!leiste || leiste.scrollWidth <= leiste.clientWidth) return;
    const lr = leiste.getBoundingClientRect(), mr = m.getBoundingClientRect();
    const ziel = leiste.scrollLeft + (mr.left + mr.width / 2) - (lr.left + lr.width / 2);
    try{ leiste.scrollTo({ left: ziel, behavior: ruhig ? "auto" : "smooth" }); }catch(e){ leiste.scrollLeft = ziel; }
  }

  // Mitdenken ohne Bewertung: keine Antwortknöpfe, kein Rot/Grün, nichts gespeichert
  function frageZeigen(fr, aufgeloest){
    kkVorher();
    try{ frageBauen(fr, aufgeloest); } finally { kkNachher(); }
  }
  function frageBauen(fr, aufgeloest){
    const box = $(".vv-kk-frage");
    if(!fr){ box.innerHTML = ""; return; }
    let liste = "";
    if(fr.reihenfolge){
      liste = aufgeloest ? '<p style="margin:0 0 6px;font-weight:700">' + esc(U.reihenfolge) + ":</p><ol>" + fr.reihenfolge.map((n, i) => '<li class="loesung"><b>' + (i + 1) + "</b><span>" + esc(n) + "</span></li>").join("") + "</ol>" : "";
    } else {
      liste = "<ul>" + fr.optionen.map((o, i) => '<li class="' + (aufgeloest && i === fr.richtig ? "loesung" : "") + '"><b>' + BUCHST[i] + "</b><span>" + esc(o) + "</span></li>").join("") + "</ul>";
    }
    box.innerHTML = '<div class="vv-md"><p class="vv-md-frage">' + esc(U.md) + ": " + esc(fr.text) + "</p>" + liste +
      (aufgeloest ? '<p class="vv-md-erkl">' + (fr.reihenfolge ? "" : "<strong>" + esc(U.richtigIst) + " " + BUCHST[fr.richtig] + ".</strong> ") + esc(fr.erklaerung) + "</p>" : "") +
      '<div class="vv-md-knoepfe">' + (aufgeloest ? "" : '<button type="button" class="vv-knopf" data-aufl>' + esc(U.aufl) + "</button>") +
      (st.wartet ? '<button type="button" class="vv-knopf haupt" data-weiter style="padding:0 18px">' + esc(U.weiter) + "</button>" : "") + "</div></div>";
    const a = box.querySelector("[data-aufl]"); if(a) a.addEventListener("click", () => { st.aufgeloest = true; frageZeigen(fr, true); });
    const w = box.querySelector("[data-weiter]"); if(w) w.addEventListener("click", () => { st.wartet = false; frageZeigen(fr, st.aufgeloest); spielen(true); bildZeigen(); });
  }

  function kameraSetzen(art, vonHand){
    if(vonHand){ st.autoKam = false; $("[data-autokam]").setAttribute("aria-pressed", "false"); }
    if(art === "uebersicht" && !(V.kameraOpt && V.kameraOpt.fest)) art = "schraeg";
    st.kamera = art;
    $$("[data-kam]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.kam === art)));
    if(!welt || st.bauend) return;
    welt.setzeKamera(art, ruhig);
    st.bedarf = 90;
  }

  function springe(t, sofort){
    st.t = Math.max(0, Math.min(V.dauer, t));
    st.wartet = false; frageKnopf();
    teaserWeg();
    const n = aktKapitel(st.t);
    if(n !== st.kapitel || sofort) kapitelZeigen(n);
    if(sofort && welt) welt.setzeKamera(welt.kameraArt(), true);
    st.bedarf = Math.max(st.bedarf, 3);
    zeichnen(0);
  }

  function spielen(an){
    st.laeuft = an;
    if(an) st.wartet = false;
    frageKnopf();
    if(an && st.t >= V.dauer - 0.05) springe(0, true);
    if(an) teaserWeg();
    const k = $("[data-spielen]");
    k.setAttribute("aria-label", an ? U.anhalten : U.abspielen);
    k.innerHTML = an ? '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  }

  function teaserWeg(){ $(".vv-teaser").hidden = true; $(".vv-buehne").classList.remove("gedimmt"); }
  function teaserZeigen(){
    if(!teaser) return;
    const box = $(".vv-teaser");
    box.innerHTML = '<div class="vv-teaser-karte" role="dialog" aria-label="' + esc(U.teaserTitel) + '"><h3>' + esc(U.teaserTitel) + "</h3><p style=\"margin:0\">" + esc(U.teaserText) + "</p>" +
      "<ul>" + (teaser.gesperrt || []).map((t) => "<li>" + esc(t) + "</li>").join("") + "</ul>" +
      '<div class="vv-md-knoepfe">' + (opt.onVollzugang ? '<button type="button" class="vv-knopf gold" data-anfrage>' + esc(U.teaserKnopf) + "</button>" : "") +
      '<button type="button" class="vv-knopf" data-nochmal>' + esc(U.nochmal) + "</button></div></div>";
    box.hidden = false;
    $(".vv-buehne").classList.add("gedimmt");
    try{ box.scrollIntoView({ block: "nearest", behavior: ruhig ? "auto" : "smooth" }); }catch(e){}
    const a = box.querySelector("[data-anfrage]"); if(a) a.addEventListener("click", () => opt.onVollzugang(daten.id));
    box.querySelector("[data-nochmal]").addEventListener("click", () => { springe(0, true); spielen(true); });
  }

  const schicht = $(".vv-schicht"), marken = {}, sichtbarAlt = {};
  function zeichnen(dt){
    $(".vv-zl-fuell").style.width = (st.t / V.dauer * 100) + "%";
    $(".vv-zl").setAttribute("aria-valuenow", st.t.toFixed(1));
    if(!welt || st.bauend) return;
    welt.stellen(st.t);
    const stand = {}; welt.fahrzeuge.forEach((f) => { stand[f.id] = f.stand; });
    const fs = stand[V.fokus];
    const kmh = Math.round((fs ? fs.v : 0) * 3.6);
    $(".vv-tempo").innerHTML = kmh + " <small>km/h</small>";
    cockpitStellen(kmh);
    const hil = VB.hilfen(st.t), sichtbar = {};
    hil.forEach((h) => { welt.hilfe(h.id, true, h.x0, h.x1, h.z0, h.z1, h.farbe, h.deckkraft); sichtbar[h.id] = h; });
    Object.keys(sichtbarAlt).forEach((id) => { if(!sichtbar[id]){ welt.hilfe(id, false); delete sichtbarAlt[id]; } });
    Object.assign(sichtbarAlt, sichtbar);
    welt.render(V.fokus, dt);
    Object.keys(marken).forEach((id) => { if(!sichtbar[id] || !sichtbar[id].text) marken[id].style.display = "none"; });
    hil.forEach((h) => {
      if(!h.text || !h.bei) return;
      let m = marken[h.id];
      if(!m){ m = document.createElement("div"); m.className = "vv-marke"; schicht.appendChild(m); marken[h.id] = m; }
      const p = welt.aufsBild(h.bei[0], h.bei[1], h.bei[2]);
      m.style.display = p.sichtbar ? "block" : "none";
      m.style.background = h.farbe === "#ffffff" ? "#555" : h.farbe;
      m.textContent = h.text[sprache] || h.text.de;
      // im Bild halten: nie über den Rand hinaus (sonst abgeschnitten)
      const bw = schicht.clientWidth, bh = schicht.clientHeight, halb = m.offsetWidth / 2 + 6, hoch = m.offsetHeight * 1.2 + 52;
      m.style.left = Math.max(halb, Math.min(bw - halb, p.x)) + "px";
      m.style.top = Math.max(hoch, Math.min(bh - 52, p.y)) + "px";
    });
  }

  // Cockpit der Fahrersicht (01.10.2026): Tacho mit Nadel und Blinkerpfeile auf der Leiste,
  // die der Motor zeichnet (welt.cockpitMasse liefert die Höhe). Quer am Handy: Vollbild.
  const buehne = $(".vv-buehne"), tachoNadel = $(".vv-tacho-nadel"), tachoZahl = $(".vv-tacho-zahl");
  function cockpitStellen(kmh){
    const an = !!welt && welt.kameraArt() === "fahrer" && !!welt.setzeCockpit;
    if(welt && welt.setzeCockpit) welt.setzeCockpit(true);
    buehne.classList.toggle("cockpit", an);
    if(!an) return;
    const m = welt.cockpitMasse(), c = $(".vv-cockpit");
    c.style.height = m.leiste + "px";
    tachoNadel.setAttribute("transform", "rotate(" + (-120 + Math.min(170, kmh) / 160 * 240).toFixed(1) + " 50 50)");
    tachoZahl.textContent = kmh;
    const f = welt.fahrzeuge.find((x) => x.id === V.fokus), s = (f && f.sig) || {}, takt = Math.floor(st.t * 3) % 2 === 0;
    $(".vv-pfeil.l").classList.toggle("an", takt && (s.blinker === "links" || s.warnblink));
    $(".vv-pfeil.r").classList.toggle("an", takt && (s.blinker === "rechts" || s.warnblink));
    // Schulterblick: Auge über dem Außenspiegel der Seite, über die geschaut wird
    $(".vv-schulter.l").classList.toggle("an", s.schulter === "links");
    $(".vv-schulter.r").classList.toggle("an", s.schulter === "rechts");
    $$(".vv-schulter").forEach((x) => { x.style.bottom = (m.leiste + 4) + "px"; x.style.width = m.links.w + "px"; });
    $("[data-vollspiel]").innerHTML = st.laeuft ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    $("[data-vollspiel]").setAttribute("aria-label", st.laeuft ? U.anhalten : U.abspielen);
  }
  $("[data-vollspiel]").addEventListener("click", () => { spielen(!st.laeuft); st.bedarf = Math.max(st.bedarf, 2); });
  $("[data-vollzu]").addEventListener("click", () => kameraSetzen("schraeg", true));

  // Schleife: zeichnet nur, wenn sich etwas bewegt (Akku schonen)
  let letzte = performance.now(), messung = [], stufe = opt.qualitaet || "hoch", raf = 0, imBild = true;
  function schleife(jetzt){
    if(st.aus) return;
    raf = requestAnimationFrame(schleife);
    const dt = Math.min(0.1, (jetzt - letzte) / 1000); letzte = jetzt;
    if(!imBild || document.hidden) return;
    if(st.laeuft && !st.bauend){
      const tNeu = st.t + dt * st.tempo, nNeu = aktKapitel(tNeu);
      if(nNeu !== st.kapitel){
        st.t = V.kapitel[nNeu].t; kapitelZeigen(nNeu);
        if(st.mitdenken && kapTxt(V.kapitel[nNeu].id).frage){ st.wartet = true; spielen(false); frageZeigen(kapTxt(V.kapitel[nNeu].id).frage, false); }
        else st.t = tNeu;
      } else st.t = tNeu;
      if(st.t >= V.dauer){ st.t = V.dauer; spielen(false); if(teaser) teaserZeigen(); }
      st.bedarf = Math.max(st.bedarf, 2);
    }
    if(st.bedarf <= 0) return;
    st.bedarf--;
    zeichnen(dt);
    if(welt && st.laeuft && messung.length < 90){
      messung.push(dt);
      if(messung.length === 90){
        const mittel = messung.reduce((a, b) => a + b, 0) / messung.length;
        if(mittel > 0.045 && stufe !== "niedrig"){ stufe = "niedrig"; welt.setzeQualitaet(stufe); }
        else if(mittel > 0.028 && stufe === "hoch"){ stufe = "mittel"; welt.setzeQualitaet(stufe); messung = []; }
      }
    }
  }

  // Bedienung
  $("[data-spielen]").addEventListener("click", () => { st.wartet = false; spielen(!st.laeuft); });
  $("[data-zurfrage]").addEventListener("click", () => {
    const f = $(".vv-md"); if(f) try{ f.scrollIntoView({ block: "center", behavior: ruhig ? "auto" : "smooth" }); }catch(e){}
  });
  // unten 90 px abziehen: dort liegt am Handy die feste Fußleiste
  const frageIo = window.IntersectionObserver ? new IntersectionObserver((e) => { frageImBlick = e[e.length - 1].intersectionRatio > 0.97; frageKnopf(); }, { rootMargin: "0px 0px -90px 0px", threshold: [0, 0.5, 0.97, 1] }) : null;
  if(frageIo) frageIo.observe($(".vv-kk-frage"));
  $("[data-kapzur]").addEventListener("click", () => { const n = Math.max(0, aktKapitel(st.t)); const ziel = st.t > V.kapitel[n].t + 1.5 ? n : Math.max(0, n - 1); spielen(false); springe(V.kapitel[ziel].t + 0.01, true); });
  $("[data-kapvor]").addEventListener("click", () => {
    const n = Math.max(0, aktKapitel(st.t));
    if(n >= V.kapitel.length - 1){ if(teaser){ spielen(false); teaserZeigen(); } return; }
    springe(V.kapitel[n + 1].t + 0.01, true); spielen(true);
  });
  $("[data-halb]").addEventListener("click", () => { st.tempo = st.tempo === 1 ? 0.5 : 1; $("[data-halb]").setAttribute("aria-pressed", String(st.tempo === 0.5)); });
  $("[data-vorn]").addEventListener("click", () => { springe(0, true); spielen(true); });
  $("[data-autokam]").addEventListener("click", () => { st.autoKam = !st.autoKam; $("[data-autokam]").setAttribute("aria-pressed", String(st.autoKam)); if(st.autoKam) kapitelZeigen(st.kapitel); });
  $("[data-md]").addEventListener("change", (e) => { st.mitdenken = e.target.checked; });
  $$("[data-var]").forEach((b) => b.addEventListener("click", () => { spielen(false); variante(b.dataset.var); }));
  const rfK = $("[data-rf]");
  if(rfK) rfK.addEventListener("click", () => {
    const andere = daten.varianten.find((v) => v.name !== st.variante);
    spielen(false); variante(andere.name);
    $(".vv-buehne").scrollIntoView({ block: "center", behavior: ruhig ? "auto" : "smooth" });
    spielen(true);
  });
  const TZ = ["tag", "daemmerung", "nacht"];
  $("[data-tz]").addEventListener("click", () => {
    st.tz = TZ[(TZ.indexOf(st.tz) + 1) % TZ.length]; $("[data-tz]").textContent = U[st.tz];
    if(welt){ welt.setzeTageszeit(st.tz); st.bedarf = 3; }
  });
  const zl = $(".vv-zl");
  const zlZeit = (e) => { const r = zl.getBoundingClientRect(); let f = (e.clientX - r.left) / r.width; if(wurzel.dir === "rtl") f = 1 - f; return Math.max(0, Math.min(1, f)) * V.dauer; };
  let ziehen = false;
  zl.addEventListener("pointerdown", (e) => { ziehen = true; try{ zl.setPointerCapture(e.pointerId); }catch(x){} springe(zlZeit(e), false); });
  zl.addEventListener("pointermove", (e) => { if(ziehen) springe(zlZeit(e), false); });
  zl.addEventListener("pointerup", () => { ziehen = false; });
  zl.addEventListener("keydown", (e) => {
    const vor = wurzel.dir === "rtl" ? "ArrowLeft" : "ArrowRight", zur = wurzel.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
    if(e.key === vor){ springe(st.t + 2, false); e.preventDefault(); }
    if(e.key === zur){ springe(st.t - 2, false); e.preventDefault(); }
  });
  let ro = null, io = null;
  function beobachten(){
    ro = new ResizeObserver(() => { if(welt) welt.groesse(); st.bedarf = Math.max(st.bedarf, 2); });
    ro.observe($(".vv-buehne"));
    if(window.IntersectionObserver){ io = new IntersectionObserver((e) => { imBild = e[0].isIntersecting; if(imBild) st.bedarf = Math.max(st.bedarf, 2); }); io.observe($(".vv-buehne")); }
    welt.groesse();
  }
  variante(daten.varianten[0].name);
  raf = requestAnimationFrame(schleife);

  return {
    zustand: () => ({ t: st.t, laeuft: st.laeuft, kapitel: st.kapitel, variante: st.variante, dauer: V.dauer, kamera: welt ? welt.kameraArt() : null, fehler3d: !$(".vv-fehler").hidden, bereit: !!welt && !st.bauend }),
    springe, spielen, variante, kameraSetzen, welt: () => welt,
    zerstoeren(){
      st.aus = true; cancelAnimationFrame(raf);
      if(ro) ro.disconnect(); if(io) io.disconnect(); if(frageIo) frageIo.disconnect();
      if(welt){
        try{
          welt.leereFahrzeuge(); if(welt.strasse){ welt.szene.remove(welt.strasse); welt.freigeben(welt.strasse); welt.strasse = null; }
          welt.dreher = []; welt.ticker = []; welt.alleHilfenAus();
          // die gemeinsame Welt bleibt für die nächste Szene; eine zusätzliche wird verworfen
          if(welt === geteilteWelt) geteiltBelegt = false;
          else { welt.renderer.dispose(); welt.renderer.forceContextLoss(); }
        }catch(e){}
      }
      wurzel.remove();
    }
  };
}
