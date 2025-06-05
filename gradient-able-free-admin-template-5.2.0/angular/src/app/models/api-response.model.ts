export interface ApiResponse <T=any>{
    success: boolean;
    message: string;
    data: any;
    errors: { [key: string]: string };
}
