# @swiftroute/shared

Shared types, constants, and utilities for SWIFTRoute microservices architecture.

## 📦 Contents

### Types (`types/index.ts`)
- **API Response Types**: `ApiResponse<T>`, standardized response format
- **User Types**: `User`, `UserRole`, `AuthenticatedRequest`
- **Parcel Types**: `Parcel`, `ParcelType`, `ParcelStatus`, `TrackingCheckpoint`
- **Payment Types**: `Payment`, `PaymentMethod`, `PaymentStatus`, `Invoice`
- **Order Hub Types**: `ExternalOrder`, `ReturnRequest`, `DeliveryPreference`
- **Notification Types**: `Notification`, `NotificationType`
- **Admin Types**: `DashboardStats`, `ActivityLog`, `SystemSettings`
- **Event Types**: `DomainEvent`, `ParcelEventType`, `PaymentEventType`

### Constants (`constants/index.ts`)
- **Service Configuration**: Ports, service names
- **User Roles**: Role mappings
- **Parcel Constants**: Types, statuses, status flow
- **Payment Constants**: Payment methods, statuses
- **Order Constants**: Platforms, statuses
- **Notification Constants**: Types, channels
- **Pricing**: Base rates, multipliers, surcharges
- **Time Constants**: Delivery estimates, JWT expiry
- **Validation**: Length limits, regex patterns
- **Rate Limits**: API rate limiting configuration
- **HTTP Status Codes**: Standard HTTP status codes
- **Error Codes**: Application error codes
- **Company Info**: Business contact information
- **Feature Flags**: Toggle features on/off

### Utilities (`utils/`)

#### Response Utilities (`utils/response.ts`)
- `sendSuccess<T>()`: Send successful API response
- `sendError()`: Send error response
- `sendValidationError()`: Send validation error
- `sendAuthError()`: Send authentication error
- `sendForbiddenError()`: Send forbidden error
- `sendNotFoundError()`: Send not found error
- `sendConflictError()`: Send conflict error
- `sendInternalError()`: Send internal server error
- `sendServiceUnavailableError()`: Send service unavailable error
- `sendRateLimitError()`: Send rate limit error
- `asyncHandler()`: Wrap async route handlers
- `paginationMeta()`: Generate pagination metadata

#### Validation Utilities (`utils/validation.ts`)
- `isValidEmail()`: Validate email format
- `isValidPhone()`: Validate phone number
- `isValidPassword()`: Validate password strength
- `isValidTrackingNumber()`: Validate tracking number format
- `isValidPostalCode()`: Validate postal code
- `isValidWeight()`: Validate weight value
- `sanitizeString()`: Remove XSS attempts
- `validateRequired()`: Check required fields
- `isValidEnum()`: Validate enum value
- `isValidUUID()`: Validate UUID format
- `isValidDate()`: Validate date string
- `isValidDateRange()`: Validate date range
- `validatePagination()`: Validate pagination params
- `createValidationError()`: Create validation error
- `mergeValidationErrors()`: Merge validation errors
- `hasValidationErrors()`: Check for validation errors

## 🚀 Usage

### In Services

```typescript
// Import types
import { ApiResponse, User, Parcel, ParcelStatus } from '../../shared/types';

// Import constants
import { PARCEL_STATUSES, HTTP_STATUS, ERROR_CODES } from '../../shared/constants';

// Import utilities
import { sendSuccess, sendError, isValidEmail } from '../../shared/utils';

// Use in route handler
app.post('/api/parcels', async (req, res) => {
  const { recipient_email } = req.body;
  
  if (!isValidEmail(recipient_email)) {
    return sendError(res, 'Invalid email format', HTTP_STATUS.BAD_REQUEST);
  }
  
  // ... business logic
  
  return sendSuccess(res, parcel, 'Parcel created', HTTP_STATUS.CREATED);
});
```

### Type-Safe Responses

```typescript
import { ApiResponse, Parcel } from '../../shared/types';

// Function returns type-safe response
async function getParcel(id: string): Promise<ApiResponse<Parcel>> {
  const parcel = await prisma.parcel.findUnique({ where: { id } });
  
  if (!parcel) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Parcel not found' }
    };
  }
  
  return {
    success: true,
    data: parcel
  };
}
```

### Using Constants

```typescript
import { PARCEL_STATUSES, PARCEL_STATUS_FLOW } from '../../shared/constants';

// Check valid status
if (status === PARCEL_STATUSES.DELIVERED) {
  // Handle delivery
}

// Get next status in flow
const currentIndex = PARCEL_STATUS_FLOW.indexOf(currentStatus);
const nextStatus = PARCEL_STATUS_FLOW[currentIndex + 1];
```

### Validation

```typescript
import { 
  validateRequired, 
  isValidEmail, 
  isValidPhone,
  createValidationError,
  mergeValidationErrors,
  hasValidationErrors
} from '../../shared/utils';

const data = req.body;
let errors = {};

// Check required fields
const { valid, missing } = validateRequired(data, ['full_name', 'email', 'phone']);
if (!valid) {
  errors = mergeValidationErrors(
    errors,
    createValidationError('required', `Missing fields: ${missing.join(', ')}`)
  );
}

// Validate email
if (data.email && !isValidEmail(data.email)) {
  errors = mergeValidationErrors(
    errors,
    createValidationError('email', 'Invalid email format')
  );
}

// Validate phone
if (data.phone && !isValidPhone(data.phone)) {
  errors = mergeValidationErrors(
    errors,
    createValidationError('phone', 'Invalid phone number')
  );
}

if (hasValidationErrors(errors)) {
  return sendValidationError(res, errors);
}
```

### Async Handler

```typescript
import { asyncHandler } from '../../shared/utils';

// Wrap async route handler - automatically catches errors
app.get('/api/parcels/:id', asyncHandler(async (req, res) => {
  const parcel = await prisma.parcel.findUnique({ where: { id: req.params.id } });
  
  if (!parcel) {
    return sendNotFoundError(res, 'Parcel');
  }
  
  return sendSuccess(res, parcel);
}));
```

## 📝 Best Practices

### 1. Always Use Shared Types
Don't redefine types in individual services - import from `shared/types`.

### 2. Use Shared Constants
Never hardcode status strings, error codes, or configuration values.

### 3. Consistent Responses
Always use `sendSuccess()` and `sendError()` helpers for API responses.

### 4. Validate Input
Use shared validation utilities for all user input.

### 5. Type Safety
Leverage TypeScript's type checking with shared types:

```typescript
import { ParcelStatus } from '../../shared/types';
import { PARCEL_STATUSES } from '../../shared/constants';

// Type-safe - compiler will catch typos
const status: ParcelStatus = PARCEL_STATUSES.DELIVERED;
```

## 🔄 Updating Shared Code

When updating shared types, constants, or utilities:

1. **Make changes in `shared/` directory**
2. **Services automatically pick up changes** (TypeScript will compile on next run)
3. **No npm publishing required** - shared code is local to the monorepo

## 🏗️ Adding New Shared Code

### Add New Type
```typescript
// shared/types/index.ts
export interface NewType {
  id: string;
  name: string;
}
```

### Add New Constant
```typescript
// shared/constants/index.ts
export const NEW_CONSTANT = {
  VALUE_A: 'value_a',
  VALUE_B: 'value_b',
} as const;
```

### Add New Utility
```typescript
// shared/utils/helpers.ts
export function newHelper(input: string): string {
  return input.toUpperCase();
}

// Export in shared/utils/index.ts
export * from './helpers';
```

## 📚 Related Documentation

- **Main README**: See project root `README.md`
- **Microservices Guide**: See `MICROSERVICES_STARTUP_GUIDE.md`
- **Audit Report**: See `MICROSERVICES_AUDIT_REPORT.md`
- **Database Schema**: See `prisma/schema.prisma`

## 🤝 Contributing

When adding shared code:
- Keep it generic and reusable
- Document with JSDoc comments
- Add examples in this README
- Ensure type safety
- Follow existing patterns

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**License**: UNLICENSED (Internal Use Only)
