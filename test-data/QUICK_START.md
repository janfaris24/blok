# Quick Start - Testing Bulk Import

## What Was Created

✅ **9 Test Files** (both CSV and Excel formats)
✅ **18 Total Files** (9 CSV + 9 Excel)
✅ **Comprehensive Test Coverage** - All scenarios covered

## Test Files Overview

| File | Format | Scenario | Should Import? |
|------|--------|----------|----------------|
| `test-import-complete` | CSV + XLSX | ✅ Perfect data | Yes - No issues |
| `test-import-missing-emails` | CSV + XLSX | ⚠️ Missing some emails | Yes - With warnings |
| `test-import-missing-phones` | CSV + XLSX | ⚠️ Missing some phones | Yes - With warnings |
| `test-import-missing-type` | CSV + XLSX | ⚠️ No type column | Yes - Defaults to owner |
| `test-import-minimal` | CSV + XLSX | ⚠️ Only required fields | Yes - With warnings |
| `test-import-invalid-data` | CSV + XLSX | ❌ Invalid formats | No - Must fix errors |
| `test-import-mixed-columns` | CSV + XLSX | ✅ Different column names | Yes - Auto-recognized |
| `test-import-missing-required` | CSV + XLSX | ❌ Missing required fields | No - Must fix errors |
| `test-import-mixed-scenarios` | CSV + XLSX | 🔀 Mix of everything | Partial - Some errors |

## Quick Test Steps

### 1. Start Your App
```bash
npm run dev
```

### 2. Navigate to Import
- Go to `http://localhost:3000/dashboard/residents`
- Click **"Importar en Masa"** button

### 3. Test Each File
Drag and drop or upload each file and verify:

#### ✅ **test-import-complete.xlsx**
- **Expected:** 5 total, 5 complete, 0 errors, 0 warnings
- **Result:** Import button enabled, all green

#### ⚠️ **test-import-missing-emails.xlsx**
- **Expected:** 5 total, 2 complete, 0 errors, 3 warnings
- **Result:** Yellow warnings, can still import

#### ⚠️ **test-import-missing-phones.xlsx**
- **Expected:** 5 total, 2 complete, 0 errors, 3 warnings
- **Result:** Yellow warnings, can still import

#### ⚠️ **test-import-missing-type.xlsx**
- **Expected:** 5 total, 0 complete, 0 errors, 5 warnings
- **Result:** All default to "Dueño", can import

#### ⚠️ **test-import-minimal.xlsx**
- **Expected:** 5 total, 0 complete, 0 errors, 15 warnings
- **Result:** 3 warnings per row, can import

#### ❌ **test-import-invalid-data.xlsx**
- **Expected:** 5 total, 1 complete, 4 errors, 1 warning
- **Result:** Red errors, import button disabled

#### ✅ **test-import-mixed-columns.xlsx**
- **Expected:** 5 total, 5 complete, 0 errors, 0 warnings
- **Result:** All column variations recognized

#### ❌ **test-import-missing-required.xlsx**
- **Expected:** 5 total, 2 complete, 3 errors, 0 warnings
- **Result:** Red errors, import button disabled

#### 🔀 **test-import-mixed-scenarios.xlsx**
- **Expected:** 10 total, 4 complete, 2 errors, 7 warnings
- **Result:** Mix of red errors and yellow warnings

## What to Look For

### ✅ Validation Works
- [ ] Stats show correct counts (Total, Complete, Errors, Warnings)
- [ ] Error messages are clear and specific
- [ ] Warning messages explain what's missing
- [ ] Red rows highlight errors
- [ ] Yellow rows highlight warnings

### ✅ Column Recognition Works
- [ ] Spanish column names recognized (Nombre, Apellido, etc.)
- [ ] English column names recognized (First Name, Last Name, etc.)
- [ ] Symbol variations recognized (#, Apt, Unit, etc.)
- [ ] Accent variations work (teléfono, telefono, móvil, movil)

### ✅ Type Mapping Works
- [ ] "dueño" → owner
- [ ] "inquilino" → renter
- [ ] "propietario" → owner
- [ ] "tenant" → renter
- [ ] Empty type → owner (default)

### ✅ Phone Formatting Works
- [ ] `7875551234` → `+17875551234`
- [ ] `787-555-1234` → `+17875551234`
- [ ] `(787) 555-1234` → `+17875551234`
- [ ] `939` area code → `+1939...`

### ✅ Import Button Logic
- [ ] Disabled when errors exist
- [ ] Enabled when only warnings exist
- [ ] Enabled when no errors/warnings

### ✅ Preview Table
- [ ] Shows first 50 rows
- [ ] Highlights error rows in red
- [ ] Highlights warning rows in yellow
- [ ] Shows "Sin email" / "Sin teléfono" for missing fields
- [ ] Shows "Por defecto: Dueño" for missing type

## Success Criteria

All tests should:
1. ✅ Parse files without crashing
2. ✅ Show correct statistics
3. ✅ Display appropriate error/warning messages
4. ✅ Enable/disable import button correctly
5. ✅ Import valid data successfully
6. ✅ Block import when critical errors exist
7. ✅ Allow import with warnings

## After Import Verification

After successful imports, verify in the database:
1. Go to Residents page
2. Check residents were created
3. Verify default values applied (type = owner if missing)
4. Verify phone formatting (all should be +1787... or +1939...)
5. Check missing fields show as empty (not "null" or "undefined")

## Regenerating Excel Files

If you modify the CSV files, regenerate Excel versions:
```bash
node test-data/generate-excel-tests.js
```

## Full Documentation

For detailed expected results for each test case, see:
📖 **TEST_CASES_README.md**

## Need Help?

Each test file is documented with:
- Expected stats (Total, Complete, Errors, Warnings)
- Expected error/warning messages
- Specific row-by-row breakdown
- What should be imported vs blocked

Check `TEST_CASES_README.md` for full details!
