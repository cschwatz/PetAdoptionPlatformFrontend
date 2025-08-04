import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Person, PersonUpdateRequest } from '../person/person.model';
import { Ong, OngUpdateRequest } from '../ong/ong.model';


export type UserType = 'PERSON' | 'ONG';


export interface UserInfo {
  userType: UserType;
  user: Person | Ong;
}


// DTO interface matching your backend response
export interface AccountMeDto {
  person: Person | null;
  ong: Ong | null;
}


@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/api';


  constructor(private http: HttpClient) {}


  // Get current user information - detects type based on which field is populated
  getCurrentUser(): Observable<UserInfo> {
    return this.http.get<AccountMeDto>(`${this.apiUrl}/account/me`).pipe(
      map((dto: AccountMeDto) => {
        // Check which field is populated in the DTO
        if (dto.person) {
          return { userType: 'PERSON' as UserType, user: dto.person };
        } else if (dto.ong) {
          return { userType: 'ONG' as UserType, user: dto.ong };
        } else {
          throw new Error('Invalid user data: both person and ong fields are null');
        }
      })
    );
  }


  // Update person information
  updatePerson(personId: string, updateData: PersonUpdateRequest): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/person/${personId}`, updateData);
  }


  // Update ONG information
  updateOng(ongId: string, updateData: OngUpdateRequest): Observable<Ong> {
    return this.http.put<Ong>(`${this.apiUrl}/ong/${ongId}`, updateData);
  }


  // Change password
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/account/password`, {
      oldPassword,
      newPassword
    });
  }
}