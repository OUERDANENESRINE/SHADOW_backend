import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductDto } from './update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantsRepository: Repository<ProductVariant>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      nom: dto.nom,
      description: dto.description,
      prix: dto.prix,
      imageUrls: dto.imageUrls || [],
      variants: dto.variants.map((v) => this.variantsRepository.create(v)),
    });
    return this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productsRepository.find({ relations: { variants: true } });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { variants: true },
    });
    if (!product) {
      throw new NotFoundException(`Produit #${id} introuvable`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.nom !== undefined) product.nom = dto.nom;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.prix !== undefined) product.prix = dto.prix;
    if (dto.imageUrls !== undefined) product.imageUrls = dto.imageUrls;

    if (dto.variants) {
      await this.variantsRepository.delete({ product: { id } });
      product.variants = dto.variants.map((v) => this.variantsRepository.create(v));
    }

    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}