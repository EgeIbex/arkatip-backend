import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class InterpretationService {
  static async interpretDream(dreamText: string): Promise<string> {    
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API anahtarı bulunamadı');
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Sen bir rüya yorumcusun. Hem klasik rüya sembolleri hem de modern psikolojik analiz üzerine eğitildin.
Rüyaları sadece sembollerle değil, gerçek yaşam olayları ve duygularla da ilişkilendiriyorsun.
Anlatımın içten, şiirsel ve insanın iç dünyasına nazikçe dokunan bir dilde olmalı.`
          },
          {
            role: "user",
            content: `Bir kullanıcı aşağıdaki rüyayı anlattı:
              "${dreamText}"
              Bu rüyayı yapılandırılmış şekilde yorumla. Lütfen şu adımları takip et:
              1. Öne çıkan sembollerin anlamlarını açıkla.
              2. Duygusal ve psikolojik bağlamda rüyanın neyi yansıtıyor olabileceğini yaz.
              3. Gerçek hayattaki olası yansımalarına dair düşüncelerini paylaş.
              4. Son olarak kısa bir kapanış cümlesiyle kişiye içsel bir bakış açısı sun.

              250 kelimeyi geçmeden yaz. Türkçe yaz. Anlayışlı, saygılı ve gerektiğinde şiirsel ol.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800 // Daha uzun yorumlar için yükseltildi
      });

      const interpretation = completion.choices[0].message.content || 'Yorum yapılamadı.';
      return interpretation;
    } catch (error) {
      console.error('Rüya yorumlama hatası:', error);
      if (error instanceof Error) {
        console.error('Hata detayı:', error.message);
      }
      throw new Error('Rüya yorumlanırken bir hata oluştu.');
    }
  }
}
