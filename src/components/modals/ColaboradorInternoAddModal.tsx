import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Eye, EyeOff, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCPF, formatPhone, formatCEP, removeMask } from '@/utils/formatters';
import { useCargosInterno } from '@/hooks/useCargosInterno';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const colaboradorSchema = z.object({
  employee_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(14, 'CPF inválido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  birth_date: z.date({ required_error: 'Data de nascimento é obrigatória' }),
  position_id: z.string().min(1, 'Selecione um cargo'),
  admission_date: z.date({ required_error: 'Data de admissão é obrigatória' }),
  salary: z.string().min(1, 'Salário obrigatório'),
  web_password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  instagram_profile: z.string().optional(),
  postal_code: z.string().optional(),
  address: z.string().optional(),
  number_address: z.string().optional(),
  address_complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  uf: z.string().max(2, 'UF deve ter 2 caracteres').optional(),
  meal_voucher_active: z.boolean(),
  meal_voucher_value: z.string().optional(),
  transport_voucher_active: z.boolean(),
  transport_voucher_value: z.string().optional(),
  health_plan: z.boolean(),
  basic_food_basket_active: z.boolean(),
  basic_food_basket_value: z.string().optional(),
  cost_assistance_active: z.boolean(),
  cost_assistance_value: z.string().optional(),
  cash_access: z.boolean(),
  evaluation_access: z.boolean(),
  training: z.boolean(),
  support: z.boolean(),
  lgpd_term: z.boolean().refine(val => val === true, { message: 'É obrigatório aceitar o termo LGPD' }),
  confidentiality_term: z.boolean().refine(val => val === true, { message: 'É obrigatório aceitar o termo de confidencialidade' }),
  system_term: z.boolean().refine(val => val === true, { message: 'É obrigatório aceitar o termo do sistema' }),
});

type ColaboradorFormData = z.infer<typeof colaboradorSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function ColaboradorInternoAddModal({ open, onClose, onSave, isLoading }: Props) {
  const { cargos } = useCargosInterno();
  const [showPassword, setShowPassword] = useState(false);
  const [searchingCEP, setSearchingCEP] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ColaboradorFormData>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: {
      meal_voucher_active: false,
      transport_voucher_active: false,
      health_plan: false,
      basic_food_basket_active: false,
      cost_assistance_active: false,
      cash_access: false,
      evaluation_access: false,
      training: false,
      support: false,
      lgpd_term: false,
      confidentiality_term: false,
      system_term: false,
    },
  });

  const mealVoucherActive = watch('meal_voucher_active');
  const transportVoucherActive = watch('transport_voucher_active');
  const basicFoodBasketActive = watch('basic_food_basket_active');
  const costAssistanceActive = watch('cost_assistance_active');
  const postalCode = watch('postal_code');

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const searchCEP = async (cep: string) => {
    const cleanCEP = removeMask(cep);
    if (cleanCEP.length !== 8) {
      toast.error('CEP deve ter 8 dígitos');
      return;
    }

    setSearchingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setValue('address', data.logradouro);
      setValue('neighborhood', data.bairro);
      setValue('city', data.localidade);
      setValue('state', data.estado);
      setValue('uf', data.uf);
      toast.success('Endereço preenchido automaticamente');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setSearchingCEP(false);
    }
  };

  const onSubmit = async (data: ColaboradorFormData) => {
    const formattedData = {
      employee_name: data.employee_name,
      cpf: removeMask(data.cpf),
      email: data.email,
      phone: removeMask(data.phone),
      birth_date: data.birth_date.toISOString().split('T')[0],
      position_id: data.position_id,
      admission_date: data.admission_date.toISOString().split('T')[0],
      salary: data.salary,
      web_password: data.web_password,
      instagram_profile: data.instagram_profile || null,
      postal_code: data.postal_code ? removeMask(data.postal_code) : null,
      address: data.address || null,
      number_address: data.number_address || null,
      address_complement: data.address_complement || null,
      neighborhood: data.neighborhood || null,
      city: data.city || null,
      state: data.state || null,
      uf: data.uf || null,
      meal_voucher_active: data.meal_voucher_active,
      meal_voucher_value: data.meal_voucher_active ? data.meal_voucher_value || null : null,
      transport_voucher_active: data.transport_voucher_active,
      transport_voucher_value: data.transport_voucher_active ? data.transport_voucher_value || null : null,
      health_plan: data.health_plan,
      basic_food_basket_active: data.basic_food_basket_active,
      basic_food_basket_value: data.basic_food_basket_active ? data.basic_food_basket_value || null : null,
      cost_assistance_active: data.cost_assistance_active,
      cost_assistance_value: data.cost_assistance_active ? data.cost_assistance_value || null : null,
      cash_access: data.cash_access,
      evaluation_access: data.evaluation_access,
      training: data.training,
      support: data.support,
      lgpd_term: data.lgpd_term,
      confidentiality_term: data.confidentiality_term,
      system_term: data.system_term,
    };

    await onSave(formattedData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Colaborador Interno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">📋 Dados Pessoais</h3>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor="employee_name">Nome Completo *</Label>
                <Controller
                  name="employee_name"
                  control={control}
                  render={({ field }) => <Input {...field} id="employee_name" />}
                />
                {errors.employee_name && (
                  <p className="text-sm text-destructive mt-1">{errors.employee_name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Controller
                    name="cpf"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="cpf"
                        value={formatCPF(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={14}
                      />
                    )}
                  />
                  {errors.cpf && <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input {...field} id="email" type="email" />}
                  />
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="phone"
                        value={formatPhone(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={15}
                      />
                    )}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <Label>Data de Nascimento *</Label>
                  <Controller
                    name="birth_date"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-destructive mt-1">{errors.birth_date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="instagram_profile">Instagram</Label>
                <Controller
                  name="instagram_profile"
                  control={control}
                  render={({ field }) => <Input {...field} id="instagram_profile" placeholder="@usuario" />}
                />
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">💼 Dados Profissionais</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cargo *</Label>
                <Controller
                  name="position_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.id} value={cargo.id}>
                            {cargo.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.position_id && (
                  <p className="text-sm text-destructive mt-1">{errors.position_id.message}</p>
                )}
              </div>

              <div>
                <Label>Data de Admissão *</Label>
                <Controller
                  name="admission_date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.admission_date && (
                  <p className="text-sm text-destructive mt-1">{errors.admission_date.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary">Salário *</Label>
                <Controller
                  name="salary"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} id="salary" placeholder="R$ 0,00" />
                  )}
                />
                {errors.salary && <p className="text-sm text-destructive mt-1">{errors.salary.message}</p>}
              </div>

              <div>
                <Label htmlFor="web_password">Senha Web *</Label>
                <Controller
                  name="web_password"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Input
                        {...field}
                        id="web_password"
                        type={showPassword ? 'text' : 'password'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                />
                {errors.web_password && (
                  <p className="text-sm text-destructive mt-1">{errors.web_password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">📍 Endereço</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="postal_code">CEP</Label>
                <div className="flex gap-2">
                  <Controller
                    name="postal_code"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="postal_code"
                        value={formatCEP(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={9}
                        className="flex-1"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => postalCode && searchCEP(postalCode)}
                    disabled={searchingCEP}
                  >
                    {searchingCEP ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => <Input {...field} id="address" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="number_address">Número</Label>
                <Controller
                  name="number_address"
                  control={control}
                  render={({ field }) => <Input {...field} id="number_address" />}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address_complement">Complemento</Label>
                <Controller
                  name="address_complement"
                  control={control}
                  render={({ field }) => <Input {...field} id="address_complement" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Controller
                  name="neighborhood"
                  control={control}
                  render={({ field }) => <Input {...field} id="neighborhood" />}
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => <Input {...field} id="city" />}
                />
              </div>

              <div>
                <Label htmlFor="uf">UF</Label>
                <Controller
                  name="uf"
                  control={control}
                  render={({ field }) => <Input {...field} id="uf" maxLength={2} />}
                />
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">💰 Benefícios</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="meal_voucher_active"
                    control={control}
                    render={({ field }) => (
                      <Switch id="meal_voucher_active" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="meal_voucher_active">Vale Refeição</Label>
                </div>
                {mealVoucherActive && (
                  <Controller
                    name="meal_voucher_value"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="R$ 0,00" className="mt-2" />
                    )}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="transport_voucher_active"
                    control={control}
                    render={({ field }) => (
                      <Switch id="transport_voucher_active" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="transport_voucher_active">Vale Transporte</Label>
                </div>
                {transportVoucherActive && (
                  <Controller
                    name="transport_voucher_value"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="R$ 0,00" className="mt-2" />
                    )}
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="health_plan"
                  control={control}
                  render={({ field }) => (
                    <Switch id="health_plan" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="health_plan">Plano de Saúde</Label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="basic_food_basket_active"
                    control={control}
                    render={({ field }) => (
                      <Switch id="basic_food_basket_active" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="basic_food_basket_active">Cesta Básica</Label>
                </div>
                {basicFoodBasketActive && (
                  <Controller
                    name="basic_food_basket_value"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="R$ 0,00" className="mt-2" />
                    )}
                  />
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="cost_assistance_active"
                    control={control}
                    render={({ field }) => (
                      <Switch id="cost_assistance_active" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="cost_assistance_active">Auxílio Custo</Label>
                </div>
                {costAssistanceActive && (
                  <Controller
                    name="cost_assistance_value"
                    control={control}
                    render={({ field }) => (
                      <Input {...field} placeholder="R$ 0,00" className="mt-2" />
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Acessos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">🔐 Acessos</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="cash_access"
                  control={control}
                  render={({ field }) => (
                    <Switch id="cash_access" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="cash_access">Acesso ao Caixa</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="evaluation_access"
                  control={control}
                  render={({ field }) => (
                    <Switch id="evaluation_access" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="evaluation_access">Acesso à Avaliação</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="training"
                  control={control}
                  render={({ field }) => (
                    <Switch id="training" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="training">Treinamento</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="support"
                  control={control}
                  render={({ field }) => (
                    <Switch id="support" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="support">Suporte</Label>
              </div>
            </div>
          </div>

          {/* Termos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">📄 Termos (Obrigatórios)</h3>
            
            <Alert>
              <AlertDescription>
                É obrigatório aceitar todos os termos abaixo para continuar
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="lgpd_term"
                    control={control}
                    render={({ field }) => (
                      <Switch id="lgpd_term" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="lgpd_term">Termo LGPD *</Label>
                </div>
                {errors.lgpd_term && (
                  <p className="text-sm text-destructive mt-1">{errors.lgpd_term.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="confidentiality_term"
                    control={control}
                    render={({ field }) => (
                      <Switch id="confidentiality_term" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="confidentiality_term">Termo de Confidencialidade *</Label>
                </div>
                {errors.confidentiality_term && (
                  <p className="text-sm text-destructive mt-1">{errors.confidentiality_term.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="system_term"
                    control={control}
                    render={({ field }) => (
                      <Switch id="system_term" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                  <Label htmlFor="system_term">Termo do Sistema *</Label>
                </div>
                {errors.system_term && (
                  <p className="text-sm text-destructive mt-1">{errors.system_term.message}</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
