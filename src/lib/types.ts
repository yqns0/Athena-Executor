export interface Media {
  id: string;
  title: string;
  description?: string;
  date: Date;
  file_path: string;
  type: 'image' | 'video';
  created_at: Date;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface LoveLetter {
  id: string;
  title: string;
  content: string;
  date: Date;
  created_at: Date;
}
