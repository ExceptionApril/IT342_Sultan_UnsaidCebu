# Software Test Plan - Unsaid Cebu

## 1. Project Scope
- **Project**: Unsaid Cebu Authentication System
- **Repository**: https://github.com/ExceptionApril/IT342_Sultan_UnsaidCebu
- **Refactor Branch**: `copilot/refactor-vertical-slice-architecture`
- **Scope Covered**: Backend authentication module in this repository
- **Out of Scope**: Web frontend and mobile application artifacts are not present in the repository

## 2. Functional Requirements Coverage

| Requirement ID | Functional Requirement | Priority | Coverage Type | Automated |
|---|---|---:|---|---|
| FR-01 | Users can register with name, email, and password | High | API integration test | Yes |
| FR-02 | The system prevents duplicate email registration | High | API integration test | Yes |
| FR-03 | The system validates registration inputs | High | API integration test | Yes |
| FR-04 | Users can log in with valid credentials | High | API integration test | Yes |
| FR-05 | The system rejects invalid login credentials | High | API integration test | Yes |
| FR-06 | The authentication health endpoint returns an OK response | Medium | API integration test | Yes |
| FR-07 | The Spring Boot application context starts successfully | High | Context load test | Yes |

## 3. Test Strategy
- **Test Levels**: Application context validation and API integration testing
- **Test Type**: Full regression test after backend refactoring
- **Environment**: Spring Boot test profile with in-memory H2 database
- **Tools**: JUnit 5, Spring Boot Test, MockMvc, JaCoCo
- **Entry Criteria**: Refactored authentication slice compiles successfully
- **Exit Criteria**: All automated regression tests pass with no blocking defects

## 4. Test Cases and Test Scripts

| Test Case ID | Requirement | Preconditions | Test Steps / Script | Expected Result | Automated Reference |
|---|---|---|---|---|---|
| TC-01 | FR-06 | Application started in test profile | Send `GET /api/auth/health` | HTTP 200 with health message | `AuthControllerIntegrationTest.healthEndpointReturnsOk` |
| TC-02 | FR-01 | Clean database | Send `POST /api/auth/register` with valid name, email, and password | HTTP 201 and success payload with generated user ID | `AuthControllerIntegrationTest.registerReturnsCreatedForValidRequest` |
| TC-03 | FR-02 | A user already exists with the email | Submit the same registration payload twice | Second request returns HTTP 400 and duplicate email message | `AuthControllerIntegrationTest.registerReturnsBadRequestForDuplicateEmail` |
| TC-04 | FR-03 | Clean database | Send `POST /api/auth/register` with invalid name, invalid email, and short password | HTTP 400 with field-level validation messages | `AuthControllerIntegrationTest.registerReturnsValidationErrorsForInvalidRequest` |
| TC-05 | FR-04 | A registered user exists | Register a user, then send `POST /api/auth/login` with valid credentials | HTTP 200 and login success payload | `AuthControllerIntegrationTest.loginReturnsOkForValidCredentials` |
| TC-06 | FR-05 | A registered user exists | Register a user, then send `POST /api/auth/login` with a wrong password | HTTP 401 and invalid credentials message | `AuthControllerIntegrationTest.loginReturnsUnauthorizedForInvalidCredentials` |
| TC-07 | FR-07 | Source code compiles | Start the Spring application context with the test profile | Context loads without startup failure | `UnsaidcebuApplicationTests.contextLoads` |

## 5. Automated Test Execution Procedure
1. Open the project root: `unsaidcebu/unsaidcebu`
2. Ensure Java 17 is available
3. Run `sh mvnw test`
4. Review `docs/evidence/maven-test.log`
5. Review coverage evidence in `docs/evidence/jacoco-summary.txt` and `docs/evidence/jacoco.csv`

## 6. Test Data
- **Valid registration data**: name=`John Doe`, email=`john@example.com`, password=`password123`
- **Valid login data**: email of an existing user with the matching password
- **Invalid login data**: existing email with incorrect password
- **Invalid registration data**: one-character name, malformed email, and password shorter than six characters

## 7. Risks and Mitigations
- **Risk**: External database connectivity may fail in CI or local offline execution  
  **Mitigation**: Automated tests use an isolated H2 in-memory database under the `test` profile.
- **Risk**: Refactoring may break endpoint contracts  
  **Mitigation**: Regression tests assert status codes, validation responses, and success payloads.

## 8. Deliverables
- Refactored backend code using a vertical slice structure
- Automated regression test suite
- Coverage evidence
- Full regression test report
