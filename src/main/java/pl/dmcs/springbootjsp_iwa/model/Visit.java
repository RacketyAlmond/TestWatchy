package pl.dmcs.springbootjsp_iwa.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String date;
    private String note;




    @ManyToOne
    @JoinTable(
            name = "user_visits",
            joinColumns = @JoinColumn(name = "visits_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    private User user;

    @JsonIgnore
    @OneToMany(mappedBy = "visit")
    private Set<Student> students = new HashSet<>();


    /*
    @OneToOne
    @JoinColumn(name = "student_id")
    private Student student;
     */
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }



    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }


    public User getUser() {
        return user;
    }

    public Set<Student> getStudents() {
        return students;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setStudents(Set<Student> students) {
        this.students = students;
    }
}
