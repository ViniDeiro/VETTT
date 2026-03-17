export const HORSE_BREEDS = [
  "Mangalarga Marchador",
  "Crioulo",
  "Quarto de Milha",
  "Árabe",
  "Puro Sangue Inglês",
  "Lusitano",
  "Appaloosa",
  "Paint Horse",
  "Campolina",
  "Brasileiro de Hipismo",
  "Pônei Brasileiro",
  "Bretão",
  "Percheron",
  "Andaluz",
  "Outra"
];

export const DOG_BREEDS = [
  "Sem Raça Definida (SRD)",
  "Golden Retriever",
  "Labrador Retriever",
  "Pastor Alemão",
  "Bulldog Francês",
  "Bulldog Inglês",
  "Poodle",
  "Shih Tzu",
  "Yorkshire Terrier",
  "Maltês",
  "Pug",
  "Rottweiler",
  "Border Collie",
  "Dachshund (Salsicha)",
  "Schnauzer",
  "Pinscher",
  "Beagle",
  "Chihuahua",
  "Spitz Alemão (Lulu)",
  "Pit Bull",
  "Outra"
];

export const CAT_BREEDS = [
  "Sem Raça Definida (SRD)",
  "Persa",
  "Siamês",
  "Maine Coon",
  "Angorá",
  "Sphynx",
  "Ragdoll",
  "British Shorthair",
  "Bengal",
  "Himalaia",
  "Munchkin",
  "Abissínio",
  "Burmês",
  "Outra"
];

export const getBreedsBySpecies = (species: string): string[] => {
  switch (species) {
    case 'Equine': return HORSE_BREEDS;
    case 'Canine': return DOG_BREEDS;
    case 'Feline': return CAT_BREEDS;
    default: return [];
  }
};
