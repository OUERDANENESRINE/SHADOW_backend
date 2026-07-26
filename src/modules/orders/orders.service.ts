import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from '../order-items/order-item.entity';
import { Product } from '../products/product.entity';
import { User } from '../users/user.entity';
import { CreateOrderDto } from './create-order.dto';

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
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const user = await this.usersRepository.findOne({
      where: { id: createOrderDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `Utilisateur #${createOrderDto.userId} introuvable`,
      );
    }

    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('La commande doit contenir au moins un produit');
    }

    // On utilise une transaction : soit tout réussit (commande + stock décrémenté),
    // soit tout échoue et rien n'est enregistré (évite les incohérences).
    return this.dataSource.transaction(async (manager) => {
      let total = 0;
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
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

      const order = this.ordersRepository.create({
        user,
        total,
        statut: OrderStatus.EN_ATTENTE,
        items: orderItems,
      });

      return manager.save(order);
    });
  }

  async findAll(): Promise<Order[]> {
  return this.ordersRepository.find({
    relations: {
      user: true,
      items: {
        product: true,
      },
    },
  });
}

async findOne(id: number): Promise<Order> {
  const order = await this.ordersRepository.findOne({
    where: { id },
    relations: {
      user: true,
      items: {
        product: true,
      },
    },
  });
  if (!order) {
    throw new NotFoundException(`Commande #${id} introuvable`);
  }
  return order;
}

async findByUser(userId: number): Promise<Order[]> {
  return this.ordersRepository.find({
    where: { user: { id: userId } },
    relations: {
      items: {
        product: true,
      },
    },
  });
}

  async updateStatus(id: number, statut: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.statut = statut;
    return this.ordersRepository.save(order);
  }

  
}