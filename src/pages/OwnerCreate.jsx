import React from 'react'
import Layout from '@/components/Layout'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'

export default function OwnerCreate() {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#0B2C4D]">Cadastro de Proprietário</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => history.back()}>Voltar</Button>
            <Button className="bg-[#0B2C4D] text-white">Salvar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-blue-50 rounded-t-xl">
              <h3 className="font-semibold text-blue-900">Dados do Proprietário</h3>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Ex.: Maria Silva" />
              </div>
              <div>
                <Label htmlFor="cpf">CPF/CNPJ</Label>
                <Input id="cpf" placeholder="000.000.000-00" />
              </div>
              <div>
                <Label htmlFor="birth">Nascimento</Label>
                <Input id="birth" type="date" />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 98765-4321" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="email@exemplo.com" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-indigo-50 rounded-t-xl">
              <h3 className="font-semibold text-indigo-900">Endereço</h3>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="street">Logradouro</Label>
                <Input id="street" placeholder="Rua/Avenida" />
              </div>
              <div>
                <Label htmlFor="number">Número</Label>
                <Input id="number" />
              </div>
              <div>
                <Label htmlFor="complement">Complemento</Label>
                <Input id="complement" />
              </div>
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Select id="state" defaultValue="SP">
                  <option>AC</option><option>AL</option><option>AP</option><option>AM</option>
                  <option>BA</option><option>CE</option><option>DF</option><option>ES</option>
                  <option>GO</option><option>MA</option><option>MT</option><option>MS</option>
                  <option>MG</option><option>PA</option><option>PB</option><option>PR</option>
                  <option>PE</option><option>PI</option><option>RJ</option><option>RN</option>
                  <option>RS</option><option>RO</option><option>RR</option><option>SC</option>
                  <option>SP</option><option>SE</option><option>TO</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="zip">CEP</Label>
                <Input id="zip" placeholder="00000-000" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm lg:col-span-2">
            <div className="p-4 border-b border-gray-100 bg-green-50 rounded-t-xl">
              <h3 className="font-semibold text-green-900">Propriedade</h3>
            </div>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="farmName">Nome da Propriedade</Label>
                <Input id="farmName" placeholder="Ex.: Haras Boa Vista" />
              </div>
              <div>
                <Label htmlFor="farmType">Tipo</Label>
                <Select id="farmType" defaultValue="Haras">
                  <option>Haras</option>
                  <option>Fazenda</option>
                  <option>Centro Equestre</option>
                  <option>Outro</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
