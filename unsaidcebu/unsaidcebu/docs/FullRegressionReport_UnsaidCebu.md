# Full Regression Test Report - Unsaid Cebu

## 1. Project Information
- **Project Name**: Unsaid Cebu Authentication System
- **Repository Link**: https://github.com/ExceptionApril/IT342_Sultan_UnsaidCebu
- **Refactor Branch**: https://github.com/ExceptionApril/IT342_Sultan_UnsaidCebu/tree/copilot/refactor-vertical-slice-architecture
- **Date Executed**: 2026-05-10
- **Scope**: Backend authentication module present in this repository

## 2. Refactoring Summary
- Reorganized the backend from a layer-based package structure into a vertical slice centered on the `auth` feature.
- Moved shared cross-cutting concerns into `shared/config` and `shared/exception`.
- Replaced embedded datasource credentials with environment-based configuration defaults.
- Added isolated test configuration and expanded automated regression coverage for all implemented backend functional requirements.

## 3. Updated Project Structure
```text
src/main/java/edu/cit/sultan/unsaidcebu/
├── UnsaidcebuApplication.java
├── features/
│   └── auth/
│       ├── api/
│       │   ├── AuthController.java
│       │   ├── AuthResponse.java
│       │   ├── LoginRequest.java
│       │   └── RegisterRequest.java
│       ├── application/
│       │   ├── AuthService.java
│       │   ├── EmailAlreadyRegisteredException.java
│       │   └── InvalidCredentialsException.java
│       ├── domain/
│       │   └── User.java
│       └── infrastructure/
│           └── UserRepository.java
└── shared/
    ├── config/
    │   └── SecurityConfig.java
    └── exception/
        ├── ApiErrorResponse.java
        └── GlobalExceptionHandler.java
```

## 4. Test Plan Documentation
- Primary test plan: [`docs/SoftwareTestPlan.md`](./SoftwareTestPlan.md)
- Test suite command: `sh mvnw test`
- Environment: Spring Boot `test` profile with H2 in-memory database

## 5. Automated Test Evidence
- Maven regression log: `docs/evidence/maven-test.log`
- JaCoCo coverage summary: `docs/evidence/jacoco-summary.txt`
- JaCoCo raw report: `docs/evidence/jacoco.csv`
- Surefire XML/text reports generated locally in `target/surefire-reports/`

## 6. Regression Test Results

| Metric | Result |
|---|---|
| Total automated tests | 7 |
| Passed | 7 |
| Failed | 0 |
| Errors | 0 |
| Line coverage | 90.57% |
| Instruction coverage | 95.20% |
| Branch coverage | 100.00% |

### Executed Automated Tests
- `AuthControllerIntegrationTest.healthEndpointReturnsOk`
- `AuthControllerIntegrationTest.registerReturnsCreatedForValidRequest`
- `AuthControllerIntegrationTest.registerReturnsBadRequestForDuplicateEmail`
- `AuthControllerIntegrationTest.registerReturnsValidationErrorsForInvalidRequest`
- `AuthControllerIntegrationTest.loginReturnsOkForValidCredentials`
- `AuthControllerIntegrationTest.loginReturnsUnauthorizedForInvalidCredentials`
- `UnsaidcebuApplicationTests.contextLoads`

## 7. Issues Found
1. **Pre-existing test instability**: the original `contextLoads` test failed because tests depended on an external PostgreSQL host that was not reachable from the execution environment.
2. **Regression gap**: the project previously had only a single context-load test and no endpoint-level regression coverage.

## 8. Fixes Applied
1. Switched application datasource settings to environment-variable based configuration with local defaults.
2. Added a dedicated `application-test.properties` file that uses H2 for automated tests.
3. Added integration tests for registration, login, duplicate email handling, validation, and health checks.
4. Added JaCoCo reporting to generate automated coverage evidence.

## 9. Conclusion
The backend authentication module remains functional after the vertical slice refactor. All implemented backend requirements covered by the repository passed the automated regression suite, and the refactored structure is more modular and maintainable.
