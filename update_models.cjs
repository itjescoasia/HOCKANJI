const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        response = await ai.models.generateContent({
          model: 'gemini-2.5-pro',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
           console.log('gemini-2.5-pro failed (503/429), falling back to gemini-2.5-flash...');
           try {
             response = await ai.models.generateContent({
               model: 'gemini-2.5-flash',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           } catch (fallbackError) {
             console.log('Fallback failed, trying gemini-2.0-flash-lite-preview-02-27...');
             response = await ai.models.generateContent({
               model: 'gemini-2.0-flash-lite-preview-02-27',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           }
        } else {
           throw error;
        }`;

const replaceStr = `        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
           try {
             response = await ai.models.generateContent({
               model: 'gemini-2.0-flash-lite-preview-02-27',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           } catch (fallbackError) {
             response = await ai.models.generateContent({
               model: 'gemini-1.5-flash-8b',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           }
        } else {
           throw error;
        }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync('server.ts', content);
  console.log("Updated model settings");
} else {
  console.log("Could not find Target Content");
}
