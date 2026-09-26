package com.quad.config;

import com.quad.entity.Role;
import com.quad.entity.User;
import com.quad.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the demo accounts listed in the README so a fresh database can be logged into straight away.
 * Disable with volx.demo-users.enabled=false.
 */
@Component
@ConditionalOnProperty(name = "volx.demo-users.enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createIfMissing("org", "org@gmail.com", "org123", Role.ORGANIZER, "Demo Organizer", "Green Singapore Community");
        createIfMissing("test", "test@gmail.com", "test123", Role.VOLUNTEER, "Test Volunteer", null);
    }

    private void createIfMissing(String username, String email, String password, Role role, String fullName,
                                 String organizationName) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .or(() -> userRepository.findByUsername(username))
                .orElse(null);
        if (user != null) {
            // Demo accounts created before account types existed: fill in the missing details once.
            if (user.getFullName() == null) {
                user.setRole(role);
                user.setFullName(fullName);
                user.setOrganizationName(organizationName);
                userRepository.save(user);
            }
            return;
        }
        user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setFullName(fullName);
        user.setOrganizationName(organizationName);
        userRepository.save(user);
    }
}
