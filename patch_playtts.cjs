const fs = require('fs');
let code = fs.readFileSync('src/utils/playTTS.ts', 'utf8');

const t1 = `        } catch (uploadError) {
          console.warn("Bulk upload failed:", uploadError);
        }
        
        // Bỏ lưu base64 vào DB để tránh lỗi vượt quá 1MB
        return null;
      }
    }
  } catch (error) {`;

const r1 = `        } catch (uploadError) {
          console.warn("Bulk upload failed:", uploadError);
        }
        
        // Return base64Url as fallback so the UI still works even if cloud save fails
        return base64Url;
      }
    }
  } catch (error) {`;
  
code = code.replace(t1, r1);
fs.writeFileSync('src/utils/playTTS.ts', code);
