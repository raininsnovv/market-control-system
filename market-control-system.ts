enum OrderStatus {
    PREPARING = "в обработке",
    SHIPPED = "отправлен",
    DELIVERED = "доставлен",
    CANCELLED = "отменён"
}

class Product {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly price: number
    ) {
        if (price <= 0) {
            throw new Error("Цена продукта должна быть положительной");
        }
    }
}

class CartItem<T extends Product> {
    constructor(
        public readonly product: T,
        public quantity: number
    ) {
        if (quantity <= 0) {
            throw new Error("Количество товара должно быть положительным");
        }
    }
}

class Cart<T extends Product> {
    private items: CartItem<T>[] = [];

    constructor(private readonly productManager: ProductManager<T>) {}

    addItem(productId: number, quantity: number): void {
        if (quantity <= 0) {
            console.log("Количество должно быть положительным");
            return;
        }

        const product = this.productManager.findProduct(productId);
        if (!product) {
            console.log(`Продукт с ID ${productId} не найден`);
            return;
        }

        const existingItem = this.items.find(item => 
            item.product.id === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push(new CartItem(product, quantity));
        }
    }

    removeItem(productId: number): void {
        const initialLength = this.items.length;
        this.items = this.items.filter(item => item.product.id !== productId);

        if (this.items.length === initialLength) {
            console.log(`Продукт с ID ${productId} отсутствует в корзине`);
        }
    }

    getItems(): CartItem<T>[] {
        return [...this.items];
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    clearCart(): void {
        this.items = [];
    }

    viewCart(): void {
        if (this.isEmpty()) {
            console.log("Корзина пуста");
            return;
        }

        console.log("Содержимое корзины:");
        this.items.forEach(item => {
            console.log(
                `${item.product.name} - Количество: ${item.quantity}, Цена: ${item.product.price * item.quantity} руб.`
            );
        });
    }
}

class ProductManager<T extends Product> {
    private products: T[] = [];

    addProduct(product: T): void {
        if (this.products.find(p => p.id === product.id)) {
            console.log(`Товар с ID ${product.id} уже существует`);
            return;
        }
        this.products.push(product);
    }

    removeProduct(id: number): void {
        this.products = this.products.filter(product => product.id !== id);
    }

    findProduct(id: number): T | undefined {
        return this.products.find(product => product.id === id);
    }

    viewProducts(): void {
        if (this.products.length === 0) {
            console.log("Нет доступных товаров");
            return;
        }

        console.log("Доступные товары:");
        this.products.forEach(product => {
            console.log(`${product.name} - ${product.price} руб.`);
        });
    }
}

class Order<T extends Product> {
    constructor(
        public readonly id: number,
        public readonly items: CartItem<T>[],
        public status: OrderStatus
    ) {}

    get totalPrice(): number {
        return this.items.reduce((total, item) =>
            total + item.product.price * item.quantity, 0
        );
    }
}

class OrderManager<T extends Product> {
    private orders: Order<T>[] = [];

    addOrder(cart: Cart<T>): void {
        if (cart.isEmpty()) {
            console.log("Невозможно создать заказ: корзина пуста");
            return;
        }

        const newOrder = new Order<T>(
            this.orders.length + 1,
            cart.getItems(),
            OrderStatus.PREPARING
        );
        this.orders.push(newOrder);
        cart.clearCart();
        console.log(`Заказ №${newOrder.id} создан успешно!`);
    }

    viewOrders(): void {
        if (this.orders.length === 0) {
            console.log("Заказов нет");
            return;
        }

        this.orders.forEach(order => {
            console.log(`Заказ №${order.id} - Статус: ${order.status}`);
            console.log("Товары в заказе:");
            order.items.forEach(item => {
                console.log(
                    `${item.product.name} - ${item.quantity} шт. по ${item.product.price} руб.`
                );
            });
            console.log(`Общая сумма заказа: ${order.totalPrice} руб.`);
        });
    }

    updateOrderStatus(orderId: number, newStatus: OrderStatus): void {
        const order = this.orders.find(order => order.id === orderId);
        if (!order) {
            console.log(`Заказ №${orderId} не найден`);
            return;
        }
        order.status = newStatus;
        console.log(`Статус заказа №${orderId} изменён на: ${newStatus}`);
    }
}

// Тестим

const productManager = new ProductManager<Product>();
const cart = new Cart<Product>(productManager);
const orderManager = new OrderManager<Product>();

// Добавляем продукты
productManager.addProduct(new Product(1, "Ноутбук", 75000));
productManager.addProduct(new Product(2, "Смартфон", 45000));
productManager.addProduct(new Product(3, "Наушники", 5000));

productManager.viewProducts();

// Работа с корзиной
cart.addItem(1, 1);
cart.addItem(2, 2);
cart.addItem(3, -1); // Ошибка: количество должно быть положительным
cart.addItem(4, 1);  // Ошибка: продукт не найден
cart.viewCart();

// Создание заказа
orderManager.addOrder(cart);
orderManager.updateOrderStatus(1, OrderStatus.SHIPPED);
orderManager.viewOrders();

console.log("\nДобавляем ещё товары в корзину:");
cart.addItem(2, 1);
cart.addItem(3, 2);
cart.viewCart();

console.log("\nСоздаём новый заказ:");
orderManager.addOrder(cart);

console.log("\nМеняем статусы заказов:");
orderManager.updateOrderStatus(1, OrderStatus.SHIPPED);
orderManager.updateOrderStatus(2, OrderStatus.PREPARING);

console.log("\nПросмотр всех заказов:");
orderManager.viewOrders();
