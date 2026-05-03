# Fix Country Page "Not Found / AbortSignal" Error
Current Working Directory: c:/Users/chrys/Desktop/altuvera/frontend

## Task: Fix \"Country Not Found signal is aborted without reason\" on country pages

### Approved Plan Summary
1. CountryPage.jsx: Better error UI + fallback country list + retry button
2. countryService.js: Static fallback data from src/data/countries.js
3. useCountries.js: Add cache layer + offline fallback
4. enhancedApiClient.js: Increase timeout (30s→60s)
5. Navbar/Home links: Validate slugs before navigation

### Step-by-Step Checklist
#### 1. [x] Create TODO.md ✅
#### 2. [ ] Read src/utils/enhancedApiClient.js (timeout config)
#### 3. [ ] Update src/pages/CountryPage.jsx (enhanced error + fallback)
#### 4. [✅] Add fallback data src/services/countryService.js & staticCountries.js
#### 5. [ ] Cache layer src/hooks/useCountries.js
#### 6. [✅] Timeout increase src/utils/enhancedApiClient.js
#### 7. [ ] Link validation Navbar/Home
#### 8. [ ] Test: npm run dev → /country/{slug}, Network tab, offline
#### 9. [ ] Backend verify: curl localhost:3001/countries/{slug}
#### 10. [ ] attempt_completion

**Current Status**: Starting fixes...

**Notes**:
- Preserve existing AbortController logic
- Fallback to static data/countries.js if API 404/timeout
- Mobile responsive error states
- Retry + \"Browse all\" fallback
