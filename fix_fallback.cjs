const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE')) {
           console.log('gemini-2.5-flash is overloaded (503), falling back to gemini-2.5-flash...');
           response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
             config: { responseMimeType: 'application/json' }
           });
        } else {
           throw error;
        }`;

const replaceStr = `      } catch (error: any) {
        const errorMsg = error.message || '';
        if (error.status === 503 || errorMsg.includes('503') || errorMsg.includes('high demand') || errorMsg.includes('UNAVAILABLE') || error.status === 429 || errorMsg.includes('429') || errorMsg.includes('Quota exceeded')) {
           console.log('gemini-2.5-flash failed (503/429), falling back to gemini-2.5-flash (or gemini-1.5-flash-8b)...');
           try {
             response = await ai.models.generateContent({
               model: 'gemini-2.0-flash-lite-preview-02-27',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           } catch (fallbackError) {
             console.log('Fallback failed, trying gemini-1.5-flash-8b...');
             response = await ai.models.generateContent({
               model: 'gemini-1.5-flash-8b',
               contents: prompt,
               config: { responseMimeType: 'application/json' }
             });
           }
        } else {
           throw error;
        }`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('server.ts', content);
