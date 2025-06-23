export interface CrudServiceInterface<T, ResponseDto = T, CreateDto = T, UpdateDto = T> {

    findAll(relations: string[]): Promise<ResponseDto[]>;
    findById(id: number, relations: string[]): Promise<ResponseDto>;
    delete(id: number): Promise<void>;
    create(data: CreateDto): Promise<ResponseDto>;
    update(id: number, data: UpdateDto): Promise<void>;
}