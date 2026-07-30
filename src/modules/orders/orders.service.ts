import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from '../order-items/order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto, CreateWalkInOrderDto, OrderItemDto } from './create-order.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async buildOrderItemsAndTotal(
    manager: any,
    items: OrderItemDto[],
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await manager.findOne(Product, {
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Produit #${item.productId} introuvable`);
      }
      if (product.stock < item.quantite) {
        throw new BadRequestException(
          `Stock insuffisant pour "${product.nom}" (disponible: ${product.stock}, demandé: ${item.quantite})`,
        );
      }

      product.stock -= item.quantite;
      await manager.save(product);

      const orderItem = this.orderItemsRepository.create({
        product,
        quantite: item.quantite,
        prixUnitaire: product.prix,
      });
      orderItems.push(orderItem);
      total += Number(product.prix) * item.quantite;
    }

    return { orderItems, total };
  }

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Utilisateur #${userId} introuvable`);
    }
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un produit');
    }

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const { orderItems, total } = await this.buildOrderItemsAndTotal(
        manager,
        createOrderDto.items,
      );

      const order = this.ordersRepository.create({
        user,
        total,
        statut: OrderStatus.EN_ATTENTE,
        items: orderItems,
      });

      return manager.save(order);
    });

    await this.notificationsService.notifyAdminsOfNewOrder(savedOrder);
    return savedOrder;
  }

  async createWalkIn(dto: CreateWalkInOrderDto): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un produit');
    }

    const savedOrder = await this.dataSource.transaction(async (manager) => {
      const { orderItems, total } = await this.buildOrderItemsAndTotal(
        manager,
        dto.items,
      );

      const order = this.ordersRepository.create({
        user: null,
        clientNom: dto.clientNom,
        total,
        statut: OrderStatus.VALIDEE, // vente déjà conclue en personne
        items: orderItems,
      });

      return manager.save(order);
    });

    await this.notificationsService.notifyAdminsOfNewOrder(savedOrder);
    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: { user: true, items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } },
    });
    if (!order) {
      throw new NotFoundException(`Commande #${id} introuvable`);
    }
    return order;
  }

  async updateStatus(id: number, statut: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.statut = statut;
    return this.ordersRepository.save(order);
  }

  async findByUser(userId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: { items: { product: true } },
    });
  }
}