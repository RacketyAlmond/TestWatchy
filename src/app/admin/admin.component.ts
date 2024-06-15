import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { VisitService } from '../services/visit.service';
import { Visit } from '../visit/visit.model';
import { StudentService } from '../students/student.service';
import { Student } from '../students/student.model';
import { UserService } from '../services/user.service';
import { User } from '../visit/user.model'; // Adjust the import path as needed

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  studentList: Student[] = [];
  filteredStudents: Student[] = [];
  student?: Student;
  visits: Visit[] = [];
  filteredVisits: Visit[] = [];
  newVisit: Visit = { id: 0, date: '', note: '', user: { id: 0, username: '', email: '', password: '', visits: [], roles:[] }, students: [] };
  visitToUpdate?: Visit;
  studentToUpdate?: Student;
  searchTerm: string = '';
  studentSearchTerm: string = '';
  sortBy: string = 'date';
  studentSortBy: string = 'surname';
  sortDirection: { [key: string]: boolean } = { date: true, surname: true };
  studentSortDirection: { [key: string]: boolean } = { surname: true, telephone: true };
  selectedFiles: File[] = [];
  files: any[] = [];

  users: User[] = []; // Added line for user data
  filteredUsers: User[] = []; // Added line for filtered user data
  selectedUserId: number | null = null;

  constructor(private visitService: VisitService, private studentService: StudentService, private userService: UserService) {}

  ngOnInit() {
    this.getUsers(); // Fetch users on init
    this.getVisits();
    this.getStudents();

  }

  getStudents(): void {
    this.studentService.getStudents()
      .subscribe(studentList => {
        this.studentList = studentList || [];
        this.filteredStudents = this.studentList;
        this.sortStudents();
      });
  }

  getUsers(): void {
    this.userService.findAllUsers().subscribe(userList => {
      this.users = userList || [];
      this.filteredUsers = this.users;
    });
  }

  add(firstname: string, lastname: string, email: string, telephone: string, note: string): void {
    firstname = firstname.trim();
    lastname = lastname.trim();
    email = email.trim();
    telephone = telephone.trim();
    note = note.trim();

    this.studentService.addStudent({ firstname, lastname, email, telephone, note } as Student)
      .subscribe({
        next: (student: Student) => {
          this.studentList.push(student);
          this.filteredStudents.push(student);
          this.sortStudents();
        },
        error: () => {},
        complete: () => {
          this.studentService.totalItems.next(this.studentList.length);
          console.log(this.studentList.length);
        }
      });
  }

  openVisitForm(userId: number): void {
    this.selectedUserId = userId;
    this.newVisit = { id: 0, date: '', note: '', user: { id: 0, username: '', email: '', password: '', visits: [], roles:[] }, students: [] };
  }

  loadUsers(): void {
    this.userService.findAllUsers().subscribe(users => {
      this.users = users;
      this.filteredUsers = users;
    });
  }
/*
  this.visitService.addVisit(this.newVisit).subscribe((visit: Visit) => {
  this.visits.push(visit);
  this.filteredVisits.push(visit);
  this.sortVisits();
  this.newVisit = { patientName: '', patientSurname: '', email: '', date: '', note: '' };


});
*/
  // Submit the new visit
  submitVisit(): void {
    if (this.selectedUserId) {
      const selectedUser = this.users.find(user => user.id === this.selectedUserId);

      if (!selectedUser) {
        console.error('Selected user not found');
        return;
      }

      this.newVisit.user.id = selectedUser.id;
      this.newVisit.user.username = selectedUser.username;
      this.newVisit.user.email = selectedUser.email;

      if (!this.newVisit.date.trim() || !this.newVisit.note.trim()) {
        console.log('Visit HAS NOT BEEN created:');
        return;
      }
      console.log('this.newVisit.user.username: ' + this.newVisit.user.username);
      console.log('this.newVisit.user.email = selectedUser.email: ' +  this.newVisit.user.email);


      this.visitService.addVisit(this.newVisit.user.id, this.newVisit)
        .subscribe((visit: Visit) => {
          this.visits.push(visit);
          console.log('Visit created:', visit);
          this.newVisit = { id: 0, date: '', note: '', user: { id: this.newVisit.user.id, username: this.newVisit.user.username, email: this.newVisit.user.email, password: '', visits: [], roles:[] }, students: [] };
          this.loadUsers();
          this.selectedUserId = null;
        });
    }
    else{
      console.log('Visit NOT created:');

    }
  }

  delete(student: Student): void {
    this.studentList = this.studentList.filter(c => c !== student);
    this.filteredStudents = this.filteredStudents.filter(c => c !== student); // Update filteredStudents
    this.studentService.deleteStudent(student).subscribe(() => {
      this.studentService.totalItems.next(this.studentList.length);
      console.log(this.studentList.length);
    });
  }

  scrollToVisitList() {
    const visitList = document.getElementById('visit-list');
    if (visitList) {
      visitList.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToPrescriptionList() {
    const prescriptionList = document.getElementById('prescription-list');
    if (prescriptionList) {
      prescriptionList.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateVisitAndUpdateScroll(visit: Visit) {
    this.populateVisitForUpdate(visit);
    this.scrollToUpdate();
  }

  scrollToUpdate() {
    const prescriptionList = document.getElementById('update-list');
    if (prescriptionList) {
      prescriptionList.scrollIntoView({ behavior: 'smooth' });
    }
  }

  deleteAll(): void {
    this.studentService.deleteStudents().subscribe(() => {
      this.studentList.length = 0;
      this.filteredStudents.length = 0;
    });
  }

  update(firstname: string, lastname: string, email: string, telephone: string, note: string, chosenToUpdateStudent: Student): void {
    let id = chosenToUpdateStudent.id;
    firstname = firstname.trim();
    lastname = lastname.trim();
    email = email.trim();
    telephone = telephone.trim();
    note = note.trim();
    console.log(id);
    if (id != undefined) {
      this.studentService.updateStudent({ firstname, lastname, email, telephone } as Student, id)
        .subscribe({
          next: (student: Student) => {
            let index = this.studentList.indexOf(chosenToUpdateStudent);
            this.studentList[index] = student;
            this.filteredStudents[index] = student;
            this.sortStudents();
          },
          error: () => { },
          complete: () => {
            this.studentService.totalItems.next(this.studentList.length);
            console.log(this.studentList.length);
          }
        });
    }
  }

  toggleStudentSort(criteria: string): void {
    this.studentSortBy = criteria;
    this.studentSortDirection[criteria] = !this.studentSortDirection[criteria];
    this.sortStudents();
  }

  sortStudents(): void {
    const direction = this.studentSortDirection[this.studentSortBy] ? 1 : -1;
    switch (this.studentSortBy) {
      case 'surname':
        this.filteredStudents.sort((a, b) => direction * a.lastname.localeCompare(b.lastname));
        break;
      case 'telephone':
        this.filteredStudents.sort((a, b) => direction * a.telephone.localeCompare(b.telephone));
        break;
      default:
        this.filteredStudents.sort((a, b) => direction * a.lastname.localeCompare(b.lastname));
        break;
    }
  }

  filterStudents(): void {
    const searchTermLower = this.studentSearchTerm.toLowerCase();
    this.filteredStudents = this.studentList.filter(student =>
      student.firstname.toLowerCase().includes(searchTermLower) ||
      student.lastname.toLowerCase().includes(searchTermLower) ||
      student.email.toLowerCase().includes(searchTermLower) ||
      student.telephone.toLowerCase().includes(searchTermLower)
    );
  }

  filterVisits(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredVisits = this.visits.filter(visit =>
      visit.user.username.toLowerCase().includes(searchTermLower) ||
      visit.user.email.toLowerCase().includes(searchTermLower) ||
      visit.date.toLowerCase().includes(searchTermLower)
    );
  }

  @ViewChild('prescriptionForm') prescriptionForm!: ElementRef;

  addStudentToVisit(visit: Visit) {
    window.scrollTo(0, 0);

    this.prescriptionForm.nativeElement['patient-Name'].value = visit.user.username;
    this.prescriptionForm.nativeElement['emailStudent'].value = visit.user.email;
    this.prescriptionForm.nativeElement['dateStudent'].value = visit.date;
  }

  getVisits(): void {
    this.visitService.findAllVisits().subscribe(data => {
      this.visits = data;
      this.filteredVisits = data;
      this.sortVisits();
    }, error => {
      console.error('Error fetching visits:', error);
    });
  }

  addVisit(): void {
    if (!this.selectedUserId || !this.newVisit.date.trim() || !this.newVisit.note.trim()) {
      return;
    }

    // Find the selected user from users array
    const selectedUser = this.users.find(user => user.id === this.selectedUserId);

    if (!selectedUser) {
      console.error('Selected user not found');
      return;
    }

    // Assign selected user's details to newVisit.user
    this.newVisit.user.id = selectedUser.id;
    this.newVisit.user.username = selectedUser.username;
    this.newVisit.user.email = selectedUser.email;

    // Add the visit using visitService
    this.visitService.addVisit(this.selectedUserId, this.newVisit)
      .subscribe((visit: Visit) => {
        this.visits.push(visit);
        console.log('Visit created:', visit);
        this.newVisit = { id: 0, date: '', note: '', user: { id: 0, username: '', email: '', password: '', visits: [], roles:[] }, students: [] };
        this.loadUsers(); // Reload users after adding a visit
        this.selectedUserId = null;
      });
  }




  deleteVisit(visit: Visit): void {
    this.visits = this.visits.filter(v => v !== visit);
    this.filteredVisits = this.filteredVisits.filter(v => v !== visit);
    this.visitService.deleteVisiter(visit).subscribe();
  }

  populateVisitForUpdate(visit: Visit): void {
    this.visitToUpdate = { ...visit };
    //this.studentToUpdate = visit.student ? { ...visit.student } : undefined;
  }

  updateVisit(): void {
    if (this.visitToUpdate) {
      this.visitService.updateVisit(this.visitToUpdate.user.id, this.visitToUpdate).subscribe(updatedVisit => {
        const index = this.visits.findIndex(v => v.id === updatedVisit.id);
        if (index !== -1) {
          this.visits[index] = updatedVisit;
          this.filteredVisits[index] = updatedVisit;
          this.sortVisits();
        }
        this.visitToUpdate = undefined;
      });
    }
  }

  /*
  updateStudent(): void {
    if (this.studentToUpdate && this.visitToUpdate?.student) {
      this.studentService.updateStudent(this.studentToUpdate, 34).subscribe(updatedStudent => {
        if (this.visitToUpdate) {
          this.visitToUpdate.student = updatedStudent;
          this.visitService.updateVisit(this.visitToUpdate).subscribe(updatedVisit => {
            const index = this.visits.findIndex(v => v.id === updatedVisit.id);
            if (index !== -1) {
              this.visits[index] = updatedVisit;
              this.filteredVisits[index] = updatedVisit;
              this.sortVisits();
            }
            this.studentToUpdate = undefined;
            this.visitToUpdate = undefined;
          });
        }
      });
    }
  }
*/
  toggleVisitSort(criteria: string): void {
    this.sortBy = criteria;
    this.sortDirection[criteria] = !this.sortDirection[criteria];
    this.sortVisits();
  }

  sortVisits(): void {
    const direction = this.sortDirection[this.sortBy] ? 1 : -1;
    switch (this.sortBy) {
      case 'date':
        this.filteredVisits.sort((a, b) => direction * a.date.localeCompare(b.date));
        break;
      case 'Patient name':
        this.filteredVisits.sort((a, b) => direction * a.user.username.localeCompare(b.user.username));
        break;
      default:
        this.filteredVisits.sort((a, b) => direction * a.date.localeCompare(b.date));
        break;
    }
  }

  filterUsers(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(searchTermLower) ||
      user.username.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower)
    );
  }
  toggleSort(criteria: string): void {
    this.sortBy = criteria;
    this.sortDirection[criteria] = !this.sortDirection[criteria];
    this.sortVisits();
  }

  toggleUserSort(criteria: string): void {
    this.sortBy = criteria;
    this.sortDirection[criteria] = !this.sortDirection[criteria];
    this.sortUsers();
  }

  sortUsers(): void {
    const direction = this.sortDirection[this.sortBy] ? 1 : -1;
    switch (this.sortBy) {
      case 'username':
        this.filteredUsers.sort((a, b) => direction * a.username.localeCompare(b.username));
        break;
      case 'email':
        this.filteredUsers.sort((a, b) => direction * a.email.localeCompare(b.email));
        break;
      default:
        this.filteredUsers.sort((a, b) => direction * a.username.localeCompare(b.username));
        break;
    }
  }

}
