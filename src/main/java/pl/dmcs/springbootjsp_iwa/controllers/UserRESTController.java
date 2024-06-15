package pl.dmcs.springbootjsp_iwa.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.dmcs.springbootjsp_iwa.model.User;
import pl.dmcs.springbootjsp_iwa.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/user")
public class UserRESTController {

    private final UserRepository userRepository;

    @Autowired
    public UserRESTController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody User user) {
        userRepository.save(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@RequestBody User user, @PathVariable("id") Long id) {
        user.setId(id);
        userRepository.save(user);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<User> updatePartOfUser(@RequestBody Map<String, Object> updates, @PathVariable("id") Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        partialUpdate(user, updates);
        return new ResponseEntity<>(user, HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        userRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/username")
    public ResponseEntity<String> getUsername() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(username, HttpStatus.OK);
    }

    @GetMapping("/email")
    public ResponseEntity<String> getEmail() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(email, HttpStatus.OK);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllUsers() {
        userRepository.deleteAll();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private void partialUpdate(User user, Map<String, Object> updates) {
        if (updates.containsKey("username")) {
            user.setUsername((String) updates.get("username"));
        }
        if (updates.containsKey("email")) {
            user.setEmail((String) updates.get("email"));
        }
        if (updates.containsKey("password")) {
            user.setPassword((String) updates.get("password"));
        }
        userRepository.save(user);
    }
}
