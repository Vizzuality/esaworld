class Contact < ActiveRecord::Base

  validates :title, presence: true, length: { minimum: 2 }

  has_attached_file :logo, styles: { medium: '230x100>' }

end
