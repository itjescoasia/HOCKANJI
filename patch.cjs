const fs = require('fs');
const content = fs.readFileSync('src/components/ReviewSession.tsx', 'utf8');
const newContent = content.replace(
`        </div>
          </>
        )}
      </div>
    </div>
  );
}`,
`        </div>
          </>
        )}
      </div>
        <div className="flex-1 shrink-0 min-h-0" />
      </div>
    </div>
  );
}`
);
fs.writeFileSync('src/components/ReviewSession.tsx', newContent);
