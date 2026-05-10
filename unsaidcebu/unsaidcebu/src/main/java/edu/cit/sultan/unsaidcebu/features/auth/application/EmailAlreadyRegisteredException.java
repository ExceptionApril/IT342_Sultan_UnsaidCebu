package edu.cit.sultan.unsaidcebu.features.auth.application;

public class EmailAlreadyRegisteredException extends RuntimeException {

    public EmailAlreadyRegisteredException(String email) {
        super("Email already registered");
    }
}
