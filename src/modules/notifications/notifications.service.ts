import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { User, UserRole } from '../users/user.entity';
import { Order } from '../orders/order.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async notifyAdminsOfNewOrder(order: Order): Promise<void> {
    const admins = await this.usersRepository.find({
      where: { role: UserRole.ADMIN },
    });

    const message = `Nouvelle commande #${order.id} reçue - Total: ${order.total} DZD`;

    const notifications = admins.map((admin) =>
      this.notificationsRepository.create({
        user: admin,
        order,
        message,
      }),
    );

    await this.notificationsRepository.save(notifications);
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (notification) {
      notification.lue = true;
      return this.notificationsRepository.save(notification);
    }
    throw new Error('Notification introuvable');
  }

  async countUnread(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { user: { id: userId }, lue: false },
    });
  }
}