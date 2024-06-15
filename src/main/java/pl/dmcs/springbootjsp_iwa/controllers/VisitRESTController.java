package pl.dmcs.springbootjsp_iwa.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import pl.dmcs.springbootjsp_iwa.model.User;
import pl.dmcs.springbootjsp_iwa.model.Visit;
import pl.dmcs.springbootjsp_iwa.repository.UserRepository;
import pl.dmcs.springbootjsp_iwa.repository.VisitRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/visit")
public class VisitRESTController {

    private final VisitRepository visitRepository;
    private final UserRepository userRepository;

    @Autowired
    public VisitRESTController(VisitRepository visitRepository, UserRepository userRepository) {
        this.visitRepository = visitRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Visit> findAllVisits() {
        return visitRepository.findAll();
    }

    @GetMapping("/username")
    public ResponseEntity<String> getUsername() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return new ResponseEntity<>(username, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Visit>> getVisitsByUserId(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<Visit> visits = visitRepository.findByUser(userOpt.get());
        return new ResponseEntity<>(visits, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Visit> addVisit(@RequestParam Long userId, @RequestBody Visit visit) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        visit.setUser(user);
        visitRepository.save(visit);
        return new ResponseEntity<>(visit, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Visit> deleteVisit(@PathVariable("id") long id) {
        Visit visit = visitRepository.findById(id);
        if (visit == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        visitRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Visit> updateVisit(@RequestBody Visit visit, @PathVariable("id") long id) {
        visit.setId(id);
        visitRepository.save(visit);
        return new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Visit> updatePartOfVisit(@RequestBody Map<String, Object> updates, @PathVariable("id") long id) {
        Visit visit = visitRepository.findById(id);
        if (visit == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        //partialUpdate(visit, updates);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping
    public ResponseEntity<Visit> deleteVisits() {
        visitRepository.deleteAll();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
