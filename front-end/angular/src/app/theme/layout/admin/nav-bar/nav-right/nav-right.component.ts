// angular import
import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import {RouterModule} from '@angular/router';


// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ChatUserListComponent } from './chat-user-list/chat-user-list.component';
import { ChatMsgComponent } from './chat-msg/chat-msg.component';
import { AuthService } from '../../../../../services/auth-service.service';
import { AuthResponse } from '../../../../../models/auth-response.model';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, ChatUserListComponent, ChatMsgComponent, RouterModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
      transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
    ])
  ]
})
export class NavRightComponent {
  
  // public props
  visibleUserList: boolean;
  chatMessage: boolean;
  friendId!: number;
  username: string | null = null;

  // constructor
  constructor(private authService: AuthService) {
    this.visibleUserList = false;
    this.chatMessage = false;
    this.authService.currentUser$.subscribe((user: AuthResponse | null) => {
      this.username = user?.username || null;
    });
  }

  // public method
  // eslint-disable-next-line
  onChatToggle(friendID: any) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }
}
