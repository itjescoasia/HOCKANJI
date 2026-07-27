const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `        response = await ai.models.generateContent({
          model: 'gemini-3.1-pro-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
           console.log('gemini-3.1-pro-preview failed (503/429), falling back to gemini-3.6-flash...');
           try {
             response = await ai.models.generateContent({
               model: 'gemini-3.6-flash',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           } catch (fallbackError) {
             console.log('Fallback failed, trying gemini-3.1-flash-lite...');
             response = await ai.models.generateContent({
               model: 'gemini-3.1-flash-lite',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           }
        } else {
           throw error;
        }`;

const replaceStr = `        response = await ai.models.generateContent({
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

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', content);
