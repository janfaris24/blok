# Test Cases for Bulk Resident Import

This directory contains test CSV files to validate the bulk import functionality. Each file tests different scenarios.

## Test Files

### 1. ✅ `test-import-complete.csv` - All Fields Complete
**Description:** Perfect data with all fields filled correctly
**Expected Result:** 5 residents, 0 errors, 0 warnings
**Tests:**
- All required fields present
- All optional fields present
- Mix of Spanish and English type values (dueño, inquilino, owner, renter, propietario)
- Clean import with no issues

**Expected Stats:**
- Total: 5
- Complete: 5
- Errors: 0
- Warnings: 0

---

### 2. ⚠️ `test-import-missing-emails.csv` - Missing Some Emails
**Description:** Valid data but 3 residents don't have email addresses
**Expected Result:** 5 residents, 0 errors, 3 warnings
**Tests:**
- Missing email should show warning (not error)
- Can still import
- Uses English column names (Unit Number, First Name, etc.)

**Expected Stats:**
- Total: 5
- Complete: 2
- Errors: 0
- Warnings: 3 (rows 202, 204, 205 missing email)

**Expected Warnings:**
- Row 3: Sin email - no podrá recibir comunicaciones por correo
- Row 5: Sin email - no podrá recibir comunicaciones por correo
- Row 6: Sin email - no podrá recibir comunicaciones por correo

---

### 3. ⚠️ `test-import-missing-phones.csv` - Missing Some Phones
**Description:** Valid data but 3 residents don't have phone numbers
**Expected Result:** 5 residents, 0 errors, 3 warnings
**Tests:**
- Missing phone should show warning (not error)
- Can still import
- Uses Spanish symbols (#) for unit column
- Uses Spanish column names (Nombre, Apellido, Correo, Celular)

**Expected Stats:**
- Total: 5
- Complete: 2
- Errors: 0
- Warnings: 3 (rows 302, 304, 305 missing phone)

**Expected Warnings:**
- Row 3: Sin teléfono - no podrá recibir WhatsApp
- Row 5: Sin teléfono - no podrá recibir WhatsApp
- Row 6: Sin teléfono - no podrá recibir WhatsApp

---

### 4. ⚠️ `test-import-missing-type.csv` - Missing Type Field
**Description:** No type column at all in the file
**Expected Result:** 5 residents, 0 errors, 5 warnings
**Tests:**
- Missing type should default to "owner"
- All residents should show warning about missing type
- Uses "Apartamento" for unit column

**Expected Stats:**
- Total: 5
- Complete: 0
- Errors: 0
- Warnings: 5 (all rows missing type)

**Expected Warnings:**
- All rows: Sin tipo - se asignará como dueño por defecto

**After Import:**
- All 5 residents should be imported as "owner" by default

---

### 5. ⚠️ `test-import-minimal.csv` - Only Required Fields
**Description:** Bare minimum data - only apt, nombre, apellido
**Expected Result:** 5 residents, 0 errors, 15 warnings (3 per resident)
**Tests:**
- Can import with only required fields
- All optional fields missing should show warnings
- No type = defaults to owner
- No email = can't receive emails
- No phone = can't receive WhatsApp

**Expected Stats:**
- Total: 5
- Complete: 0
- Errors: 0
- Warnings: 15 (each row has 3 warnings: no email, no phone, no type)

**Expected Warnings (per row):**
- Sin email - no podrá recibir comunicaciones por correo
- Sin teléfono - no podrá recibir WhatsApp
- Sin tipo - se asignará como dueño por defecto

---

### 6. ❌ `test-import-invalid-data.csv` - Invalid Email/Phone Formats
**Description:** Contains invalid email formats and invalid phone numbers
**Expected Result:** Cannot import until fixed
**Tests:**
- Invalid email format should block import
- Invalid phone format should block import
- Shows which rows have errors

**Expected Stats:**
- Total: 5
- Complete: 1
- Errors: 4
- Warnings: 1

**Expected Errors:**
- Row 3: email - Email inválido (bademailemail)
- Row 4: phone - Teléfono inválido (123)
- Row 5: email - Email inválido (notanemail)
- Row 5: phone - Teléfono inválido (abc123)
- Row 6: phone - Teléfono inválido (invalid-phone)

**Expected Warnings:**
- Row 6: Sin email

**Cannot Import Until:**
- Rows 602, 603, 604, 605 are fixed

---

### 7. ✅ `test-import-mixed-columns.csv` - Different Column Name Variations
**Description:** Tests column name recognition with various formats
**Expected Result:** 5 residents, 0 errors, 0 warnings
**Tests:**
- "Apto" instead of "Apt"
- "Primer Nombre" instead of "First Name"
- "Apellidos" instead of "Last Name"
- "Correo Electrónico" instead of "Email"
- "Móvil" instead of "Phone"
- Different type values: Propietario, Inquilino, Dueño, Arrendatario, Owner
- Different phone formats: 787-555-1234, (787) 555-5678, 7875551111, 787 555 2222, +17875553333

**Expected Stats:**
- Total: 5
- Complete: 5
- Errors: 0
- Warnings: 0

**Tests Column Recognition:**
- All variations should be recognized automatically
- All phone formats should be normalized
- All type variations should map correctly

---

### 8. ❌ `test-import-missing-required.csv` - Missing Required Fields
**Description:** Missing critical required fields (unit, first name, last name)
**Expected Result:** Cannot import until fixed
**Tests:**
- Missing unit number blocks import
- Missing first name blocks import
- Missing last name blocks import

**Expected Stats:**
- Total: 5
- Complete: 2
- Errors: 3
- Warnings: 0

**Expected Errors:**
- Row 3: unit_number - Número de unidad requerido (empty unit)
- Row 4: first_name - Nombre requerido (empty first name)
- Row 5: last_name - Apellido requerido (empty last name)

**Cannot Import Until:**
- Rows 802, 803, 804 are fixed

---

### 9. 🔀 `test-import-mixed-scenarios.csv` - Comprehensive Mixed Test
**Description:** Combination of various valid and invalid scenarios
**Expected Result:** Mix of complete, warnings, and errors
**Tests:**
- Row 901: Perfect data ✅
- Row 902: Missing phone ⚠️
- Row 903: Missing email ⚠️
- Row 904: Missing type ⚠️
- Row 905: Invalid phone format ❌
- Row 906: Invalid email format ❌
- Row 907: Complete with "inquilino" type ✅
- Row 908: Missing email, phone, and type ⚠️⚠️⚠️
- Row 909: Complete with "propietario" type ✅
- Row 910: Complete with "tenant" type and 939 area code ✅

**Expected Stats:**
- Total: 10
- Complete: 4
- Errors: 2
- Warnings: 7

**Expected Errors:**
- Row 906: phone - Teléfono inválido
- Row 907: email - Email inválido

**Expected Warnings:**
- Row 903: Sin teléfono
- Row 904: Sin email
- Row 905: Sin tipo
- Row 909: Sin email
- Row 909: Sin teléfono
- Row 909: Sin tipo

**Cannot Import Until:**
- Rows 905 and 906 are fixed (invalid formats)

---

## How to Test

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Residents page:**
   - Go to Dashboard → Residents
   - Click "Importar en Masa" button

3. **Upload each test file:**
   - Drag and drop or select each CSV file
   - Review the preview and validation messages
   - Compare actual results with expected results above

4. **Verify:**
   - Check stats match expectations
   - Verify error/warning messages
   - Confirm import button is enabled/disabled correctly
   - For successful imports, check residents were created in database

## Expected Behavior Summary

### ✅ Should Allow Import:
- Complete data
- Missing emails (with warnings)
- Missing phones (with warnings)
- Missing type (with warnings, defaults to owner)
- Minimal data (only required fields)
- Different column name variations
- Different phone formats (will be normalized)

### ❌ Should Block Import:
- Missing unit number
- Missing first name
- Missing last name
- Invalid email format (if provided)
- Invalid phone format (if provided)

### Phone Format Normalization:
- `7875551234` → `+17875551234`
- `787-555-1234` → `+17875551234`
- `(787) 555-1234` → `+17875551234`
- `787 555 1234` → `+17875551234`
- `+17875551234` → `+17875551234` (unchanged)
- `9395551234` → `+19395551234`

### Type Mapping:
- `owner`, `Owner`, `dueño`, `Dueño`, `propietario`, `Propietario` → `owner`
- `renter`, `Renter`, `inquilino`, `Inquilino`, `tenant`, `Tenant`, `arrendatario`, `Arrendatario` → `renter`
- Empty or missing → `owner` (default)

## Success Criteria

All test cases should:
1. Show correct statistics (Total, Complete, Errors, Warnings)
2. Display appropriate error/warning messages
3. Enable/disable import button correctly
4. Import data successfully when valid
5. Reject import when critical errors exist
6. Allow import with warnings
7. Normalize phone numbers correctly
8. Map type values correctly
9. Recognize all column name variations
10. Default missing type to "owner"
