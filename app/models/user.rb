class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :registerable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :trackable, :validatable

  validates :email, presence: true,
    format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i }

  belongs_to :organization

  def can_manage? case_study
    return true if is_admin?
    return false if !organization
    organization_id == case_study.organization_id
  end
end
