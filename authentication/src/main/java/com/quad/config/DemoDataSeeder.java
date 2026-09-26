package com.quad.config;

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
        createIfMissing("org", "org@gmail.com", "org123");
        createIfMissing("test", "test@gmail.com", "test123");
    }

    private void createIfMissing(String username, String email, String password) {
        if (userRepository.existsByEmailIgnoreCase(email) || userRepository.existsByUsername(username)) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }
}
